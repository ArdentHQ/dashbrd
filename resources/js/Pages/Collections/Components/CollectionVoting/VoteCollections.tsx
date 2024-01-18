import { router } from "@inertiajs/core";
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
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { CollectionsVoteReceivedModal } from "@/Pages/Collections/Components/CollectionsVoteReceivedModal";
import { FormatCrypto } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

type VoteCollectionVariants = "selected" | "voted" | undefined;

export const VoteCollections = ({
    collections,
    votedCollection,
    user,
}: {
    collections: App.Data.Collections.VotableCollectionData[];
    votedCollection: App.Data.Collections.VotableCollectionData | null;
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();

    const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>(undefined);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const { isSmAndAbove } = useBreakpoint();
    const { signedAction } = useAuthorizedAction();

    const collection = useMemo(
        () => collections.filter((c) => c.id === selectedCollectionId)[0],
        [collections, selectedCollectionId],
    );

    const getVariant = (collectionId: number): VoteCollectionVariants =>
        votedCollection?.id === collectionId ? "voted" : selectedCollectionId === collectionId ? "selected" : undefined;

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
                    },
                },
            );
        });
    };

    const collectionsWithVote = useMemo(() => {
        const eligibleCollections = collections.filter((c) => !c.alreadyWon);

        const shouldMergeUserVote =
            votedCollection !== null &&
            !eligibleCollections.slice(0, 8).some((collection) => collection.id === votedCollection.id);

        if (shouldMergeUserVote) {
            if (isSmAndAbove) {
                return [...eligibleCollections.slice(0, 7), votedCollection];
            } else {
                return [...eligibleCollections.slice(0, 3), votedCollection];
            }
        }

        if (isSmAndAbove) {
            return eligibleCollections.slice(0, 8);
        }

        return eligibleCollections.slice(0, 4);
    }, [isSmAndAbove, collections, votedCollection]);

    const nominatableCollections = useMemo(() => {
        if (isSmAndAbove) {
            return collections.slice(8, 13);
        }

        return collections.slice(4, 9);
    }, [isSmAndAbove, collections]);

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
                                votedId={votedCollection?.id}
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
                                index={index + 4}
                                collection={collection}
                                setSelectedCollectionId={setSelectedCollectionId}
                                votedId={votedCollection?.id}
                                variant={getVariant(collection.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <VoteCountdown
                        onSubmit={vote}
                        isDisabled={loading || selectedCollectionId === undefined}
                        hasUserVoted={votedCollection !== null}
                    />

                    {votedCollection === null && (
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

                <NominationDialog
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    initialCollections={nominatableCollections}
                    user={user}
                    votedCollection={votedCollection}
                />
            </div>

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
            <div
                onClick={() => {
                    if (!isTruthy(votedId)) {
                        setSelectedCollectionId(collection.id);
                    }
                }}
                tabIndex={0}
                className={cn("relative overflow-hidden rounded-lg px-4 py-4 focus:outline-none md:py-3", {
                    "border-2 border-theme-primary-600 dark:border-theme-hint-400":
                        variant === "selected" || variant === "voted",
                    "pointer-events-none bg-theme-primary-50 dark:bg-theme-dark-800": variant === "voted",
                    "border border-theme-secondary-300 dark:border-theme-dark-700": variant === undefined,
                    "cursor-pointer": !hasVoted,
                    "hover:outline hover:outline-theme-hint-100 focus:ring focus:ring-theme-hint-100 dark:hover:outline-theme-dark-500 dark:focus:ring-theme-dark-500":
                        !hasVoted && variant === undefined,
                })}
                data-testid="VoteCollectionTrigger"
            >
                {variant === "voted" && (
                    <div className="absolute -right-px -top-px">
                        <Icon
                            name="VotedCollectionCheckmark"
                            size="xl"
                            className="text-theme-primary-600 dark:text-theme-hint-400"
                        />
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex">
                            <div
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
                            </div>
                            <div className="relative -ml-2 h-8 w-8 shrink-0 xs:h-12 xs:w-12">
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
                            </div>
                        </div>

                        <div className="break-word-legacy min-w-0 space-y-0.5 ">
                            <p
                                data-testid="CollectionName__name"
                                className="truncate text-base font-medium text-theme-secondary-900 dark:text-theme-dark-50 md-lg:text-base"
                            >
                                {collection.name}
                            </p>
                            <p className="hidden text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block">
                                {t("common.vol")}:{" "}
                                <FormatCrypto
                                    value={collection.volume ?? "0"}
                                    token={{
                                        symbol: "ETH",
                                        name: "ETH",
                                        decimals: 18,
                                    }}
                                />
                            </p>
                            <div className="mt-0.5 md-lg:hidden">
                                <VoteCount
                                    iconClass="h-6 w-8"
                                    textClass="text-sm md:text-sm"
                                    voteCount={collection.votes}
                                    showVoteCount={hasVoted}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="ml-2 hidden md-lg:block">
                        <VoteCount
                            voteCount={collection.votes}
                            showVoteCount={hasVoted}
                        />
                    </div>
                </div>
            </div>
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
