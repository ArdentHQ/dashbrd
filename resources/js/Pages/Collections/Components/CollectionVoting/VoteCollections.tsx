import { router } from "@inertiajs/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import cn from "classnames";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { NominationDialog } from "./NominationDialog";
import { VoteCountdown } from "./VoteCountdown";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { LinkButton } from "@/Components/Link";
import { Skeleton } from "@/Components/Skeleton";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { CollectionsVoteReceivedModal } from "@/Pages/Collections/Components/CollectionsVoteReceivedModal";
import { FormatVolume } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";
import { range } from "@/utils/range";

type VoteCollectionVariants = "selected" | "voted" | undefined;

export const VoteCollections = ({ auth }: { auth: App.Data.AuthData | null }): JSX.Element => {
    const { t } = useTranslation();

    const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>(undefined);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const { isSmAndAbove } = useBreakpoint();
    const { signedAction } = useAuthorizedAction();

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["votable-collections", auth?.wallet?.address],
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<{
                votedCollection: App.Data.Collections.VotableCollectionData | null;
                collections: App.Data.Collections.VotableCollectionData[];
            }>(route("api:votable-collections")),
    });

    const collection = useMemo(
        () => data?.collections.filter((c) => c.id === selectedCollectionId)[0],
        [data, selectedCollectionId],
    );

    const getVariant = (collectionId: number): VoteCollectionVariants =>
        data?.votedCollection?.id === collectionId
            ? "voted"
            : selectedCollectionId === collectionId
              ? "selected"
              : undefined;

    const [loading, setLoading] = useState(false);

    const vote = (): void => {
        void signedAction((): void => {
            setLoading(true);

            router.post(
                route("collection-votes.create", selectedCollectionId),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => {
                        setLoading(false);

                        setShowConfirmationDialog(true);

                        void (async () => {
                            await refetch();
                        })();
                    },
                },
            );
        });
    };

    const collectionsWithVote = useMemo(() => {
        const eligibleCollections = data?.collections.filter((c) => !c.alreadyWon) ?? [];

        const shouldMergeUserVote =
            data?.votedCollection !== null &&
            !eligibleCollections.slice(0, 8).some((collection) => collection.id === data?.votedCollection?.id);

        if (shouldMergeUserVote && data?.votedCollection !== undefined && data.votedCollection !== null) {
            if (isSmAndAbove) {
                return [...eligibleCollections.slice(0, 7), data.votedCollection];
            } else {
                return [...eligibleCollections.slice(0, 3), data.votedCollection];
            }
        }

        if (isSmAndAbove) {
            return eligibleCollections.slice(0, 8);
        }

        return eligibleCollections.slice(0, 4);
    }, [isSmAndAbove, data]);

    const nominatableCollections = useMemo(() => {
        if (isSmAndAbove) {
            return data?.collections.slice(8, 13).reverse() ?? [];
        }

        return data?.collections.slice(4, 9).reverse() ?? [];
    }, [isSmAndAbove, data]);

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    return (
        <>
            <div className="flex w-full min-w-0 flex-col justify-center gap-4 rounded-xl border-theme-secondary-300 p-0 dark:border-theme-dark-700 lg:gap-6 lg:px-8 lg:pb-0 lg:pt-8 xl:border xl:pb-8">
                <Heading
                    level={1}
                    as="h2"
                >
                    {t("pages.collections.vote.vote_for_top_collection")}
                </Heading>

                {(isLoading || isRefetching) && <LoadingScreen />}

                {!isLoading && !isRefetching && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-2.5">
                            <div
                                className="max-w-full flex-1 space-y-2"
                                data-testid="VoteCollections_Left"
                            >
                                {collectionsWithVote.slice(0, 4).map((collection, index) => (
                                    <VoteCollection
                                        key={index}
                                        index={index + 1}
                                        collection={collection}
                                        setSelectedCollectionId={setSelectedCollectionId}
                                        votedId={data?.votedCollection?.id}
                                        variant={getVariant(collection.id)}
                                    />
                                ))}
                            </div>
                            <div
                                className="hidden flex-1 space-y-2 sm:block"
                                data-testid="VoteCollections_Right"
                            >
                                {collectionsWithVote.slice(4, 8).map((collection, index) => (
                                    <VoteCollection
                                        key={index}
                                        index={index + 5}
                                        collection={collection}
                                        setSelectedCollectionId={setSelectedCollectionId}
                                        votedId={data?.votedCollection?.id}
                                        variant={getVariant(collection.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                            <VoteCountdown
                                onSubmit={vote}
                                isDisabled={loading || selectedCollectionId === undefined}
                                hasUserVoted={data?.votedCollection !== null}
                            />

                            {data?.votedCollection === null && nominatableCollections.length > 0 && (
                                <LinkButton
                                    onClick={(): void => {
                                        setIsDialogOpen(true);
                                    }}
                                    variant="link"
                                    className="font-medium leading-6 dark:hover:decoration-theme-primary-400"
                                    fontSize="!text-base"
                                    textColor="!text-theme-primary-600 dark:!text-theme-primary-400"
                                >
                                    {t("pages.collections.vote.or_nominate_collection")}
                                </LinkButton>
                            )}
                        </div>
                    </>
                )}
            </div>

            <NominationDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                initialCollections={nominatableCollections}
                user={auth?.user ?? null}
                votedCollection={data?.votedCollection}
                onSubmit={() => {
                    void (async () => {
                        await refetch();
                    })();
                }}
            />

            <CollectionsVoteReceivedModal
                isOpen={showConfirmationDialog}
                onClose={() => {
                    setShowConfirmationDialog(false);
                    setSelectedCollectionId(0);
                }}
                collection={collection}
            />
        </>
    );
};

export const VoteCollection = ({
    collection,
    votedId,
    variant,
    setSelectedCollectionId,
    index,
}: {
    collection: App.Data.Collections.VotableCollectionData;
    index: number;
    votedId?: number;
    variant?: VoteCollectionVariants;
    setSelectedCollectionId: (collectionId: number) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const hasVoted = isTruthy(votedId);

    return (
        <div className={cn("rounded-lg", { "border border-transparent": variant === undefined })}>
            <button
                type="button"
                onClick={() => {
                    if (!hasVoted) {
                        setSelectedCollectionId(collection.id);
                    }
                }}
                disabled={hasVoted}
                className={cn(
                    "relative w-full overflow-hidden rounded-lg px-4 py-4 text-left focus:outline-none md:py-3",
                    {
                        "border-2 border-theme-primary-600 dark:border-theme-hint-400":
                            variant === "selected" || variant === "voted",
                        "bg-theme-primary-50 dark:bg-theme-dark-800": variant === "voted",
                        "border border-theme-secondary-300 dark:border-theme-dark-700": variant === undefined,
                        "cursor-pointer": !hasVoted,
                        "cursor-default": hasVoted,
                        "hover:outline hover:outline-theme-hint-100 focus:ring focus:ring-theme-hint-100 dark:hover:outline-theme-dark-500 dark:focus:ring-theme-dark-500":
                            !hasVoted && variant === undefined,
                    },
                )}
                data-testid="VoteCollectionTrigger"
            >
                {variant === "voted" && (
                    <span className="absolute -right-px -top-px">
                        <Icon
                            name="VotedCollectionCheckmark"
                            size="xl"
                            className="text-theme-primary-600 dark:text-theme-hint-400"
                        />
                    </span>
                )}

                <span className="flex items-center justify-between">
                    <span className="flex min-w-0 flex-1 items-center space-x-3">
                        <span className="flex">
                            <span
                                className={cn(
                                    "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full dark:bg-theme-vote-background xs:h-12 xs:w-12",
                                    {
                                        "bg-theme-secondary-100": variant !== "voted",
                                        "bg-theme-primary-100": variant === "voted",
                                    },
                                )}
                            >
                                <span className="font-medium text-theme-secondary-700 dark:text-theme-dark-200">
                                    {collection.rank ?? index}
                                </span>
                            </span>

                            <span className="relative -ml-2 h-8 w-8 shrink-0 xs:h-12 xs:w-12">
                                <Img
                                    wrapperClassName="aspect-square"
                                    className={cn(
                                        "h-full w-full rounded-full bg-white object-cover ring-4  dark:bg-theme-dark-700 dark:ring-theme-dark-900",
                                        {
                                            "ring-white dark:ring-theme-dark-900": variant !== "voted",
                                            "ring-theme-primary-50 dark:ring-theme-dark-800": variant === "voted",
                                        },
                                    )}
                                    isCircle
                                    src={collection.image}
                                />
                            </span>
                        </span>

                        <span className="break-word-legacy min-w-0 space-y-0.5 ">
                            <span
                                data-testid="CollectionName__name"
                                className="block truncate text-base font-medium text-theme-secondary-900 dark:text-theme-dark-50 md-lg:text-base"
                            >
                                {collection.name}
                            </span>

                            <span className="hidden text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block">
                                {t("common.vol")}: <FormatVolume volume={collection.volume} />
                            </span>

                            <span className="mt-0.5 md-lg:hidden">
                                <VoteCount
                                    iconClass="h-6 w-8"
                                    textClass="text-sm md:text-sm"
                                    voteCount={collection.votes}
                                    showVoteCount={hasVoted}
                                />
                            </span>
                        </span>
                    </span>

                    <span className="ml-2 hidden md-lg:block">
                        <VoteCount
                            voteCount={collection.votes}
                            showVoteCount={hasVoted}
                        />
                    </span>
                </span>
            </button>
        </div>
    );
};

export const VoteCount = ({
    iconClass,
    textClass,
    voteCount,
    showVoteCount,
}: {
    iconClass?: string;
    textClass?: string;
    voteCount: number | null;
    showVoteCount: boolean;
}): JSX.Element => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center space-x-2">
            <p
                className={twMerge(
                    "text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-6",
                    textClass,
                )}
            >
                Votes
            </p>
            {showVoteCount ? (
                <p className={twMerge("font-medium text-theme-secondary-900 dark:text-theme-dark-50", textClass)}>
                    {voteCount}
                </p>
            ) : (
                <Tooltip content={t("pages.collections.vote.vote_to_reveal")}>
                    <div>
                        <Icon
                            className={twMerge("h-7 w-9", iconClass)}
                            name="HiddenVote"
                            size="2xl"
                        />
                    </div>
                </Tooltip>
            )}
        </div>
    );
};

const LoadingScreen = (): JSX.Element => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-2.5">
            <div className="max-w-full flex-1 space-y-2">
                {range(4).map((index) => (
                    <LoadingItem key={index} />
                ))}
            </div>

            <div className="hidden flex-1 space-y-2 sm:block">
                {range(4).map((index) => (
                    <LoadingItem key={index} />
                ))}
            </div>
        </div>

        <div className="flex h-12 w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <Skeleton
                className="h-8 w-72"
                animated
            />
        </div>
    </>
);

const LoadingItem = (): JSX.Element => (
    <div className="flex h-[84px] items-center justify-between rounded-lg border border-theme-secondary-300 p-4 dark:border-theme-dark-700 md:h-[76px]">
        <div className="flex items-center">
            <Skeleton
                isCircle
                className="h-12 w-12"
                animated
            />

            <div className="relative -ml-2 rounded-full ring-4 ring-white dark:ring-theme-dark-900">
                <Skeleton
                    isCircle
                    className="h-12 w-12"
                    animated
                />
            </div>

            <div className="ml-4 flex flex-col space-y-1">
                <Skeleton
                    className="h-4 w-32"
                    animated
                />

                <Skeleton
                    className="h-3 w-20"
                    animated
                />
            </div>
        </div>

        <Skeleton
            className="hidden h-5 w-16 lg:block"
            animated
        />
    </div>
);
