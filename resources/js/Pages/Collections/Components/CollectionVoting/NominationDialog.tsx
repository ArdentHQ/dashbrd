import { router } from "@inertiajs/core";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NomineeCollections } from "./NomineeCollections";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { LoadingBlock } from "@/Components/LoadingBlock/LoadingBlock";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useDebounce } from "@/Hooks/useDebounce";
import { CollectionsVoteReceivedModal } from "@/Pages/Collections/Components/CollectionsVoteReceivedModal";

const NominationDialogFooter = ({
    setIsOpen,
    selectedCollection,
    setSelectedCollection,
    onSubmit,
    isDisabled,
    votedCollection,
}: {
    setIsOpen: (isOpen: boolean) => void;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
    onSubmit: () => void;
    isDisabled: boolean;
    votedCollection?: null | App.Data.Collections.VotableCollectionData;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="w-full border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:flex sm:flex-row sm:justify-end">
            <div className="flex flex-row items-center justify-center gap-3 ">
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        setIsOpen(false);
                        setSelectedCollection(0);
                    }}
                    className="w-full justify-center"
                >
                    {t("common.cancel")}
                </Button>

                <Tooltip
                    content={
                        votedCollection !== null
                            ? t("pages.collections.vote.already_voted")
                            : t("pages.collections.vote.select_collection")
                    }
                >
                    <div>
                        <Button
                            variant="primary"
                            onClick={onSubmit}
                            disabled={selectedCollection === 0 || isDisabled || votedCollection !== null}
                            className="w-full items-end justify-center md:px-8"
                        >
                            {t("common.vote")}
                        </Button>
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

export const NominationDialog = ({
    isOpen,
    setIsOpen,
    initialCollections,
    user,
    votedCollection,
    onSubmit,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialCollections: App.Data.Collections.VotableCollectionData[];
    user: App.Data.UserData | null;
    votedCollection?: null | App.Data.Collections.VotableCollectionData;
    onSubmit: () => void;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const [collections, setCollections] = useState(initialCollections);

    const { signedAction } = useAuthorizedAction();

    const [debouncedQuery] = useDebounce(query, 500);

    const searchCollections = async (): Promise<void> => {
        setSelectedCollection(0);

        if (debouncedQuery.trim().length === 0) {
            setCollections(initialCollections);

            return;
        }

        setSearching(true);

        const { data } = await axios.get<{
            collections: App.Data.Collections.VotableCollectionData[];
        }>(route("nominatable-collections", { query: debouncedQuery }));

        setCollections(data.collections.reverse());
        setSearching(false);
    };

    useEffect(() => {
        if (isOpen) {
            void searchCollections();
        }
    }, [debouncedQuery]);

    useEffect(() => {
        if (!isOpen) {
            // To offset the transition...
            setTimeout(() => {
                setQuery("");
                setCollections(initialCollections);
            }, 200);
        } else {
            setQuery("");
            setCollections(initialCollections);
        }
    }, [isOpen]);

    const collection = useMemo(
        () => collections.filter((c) => c.id === selectedCollection)[0],
        [collections, selectedCollection],
    );

    const vote = (): void => {
        void signedAction((): void => {
            setLoading(true);

            router.post(
                route("collection-votes.create", collection),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => {
                        setLoading(false);
                        setIsOpen(false);

                        setShowConfirmationDialog(true);

                        onSubmit();
                    },
                },
            );
        });
    };

    return (
        <>
            <Dialog
                title={t("pages.collections.vote.nominate_collection")}
                isOpen={isOpen}
                onClose={(): void => {
                    setIsOpen(false);
                    setSelectedCollection(0);
                }}
                panelClassName="md:max-w-[640px] md-lg:max-w-[720px] lg:max-w-[790px] sm:!h-[754px] justify-between sm:flex"
                innerWrapperClassName="overflow-y-auto"
                footer={
                    <NominationDialogFooter
                        setIsOpen={setIsOpen}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                        onSubmit={vote}
                        isDisabled={loading || searching}
                        votedCollection={votedCollection}
                    />
                }
            >
                <div className="flex flex-col md:gap-0">
                    <SearchInput
                        placeholder={t("pages.collections.search_placeholder")}
                        query={query}
                        onChange={setQuery}
                    />

                    {searching && (
                        <div>
                            {/* Added to enforce table headers */}
                            <NomineeCollections
                                collections={[]}
                                activeSort=""
                                user={user}
                                selectedCollection={0}
                                setSelectedCollection={setSelectedCollection}
                                showHeaderWhenEmpty
                            />

                            <LoadingBlock text={t("pages.collections.search.loading_results")} />
                        </div>
                    )}

                    {collections.length === 0 && !searching && (
                        <div>
                            {/* Added to enforce table headers */}
                            <NomineeCollections
                                collections={[]}
                                activeSort=""
                                user={user}
                                selectedCollection={0}
                                setSelectedCollection={setSelectedCollection}
                                showHeaderWhenEmpty
                            />

                            <EmptyBlock>{t("pages.collections.search.no_results")}</EmptyBlock>
                        </div>
                    )}

                    {!searching && (
                        <NomineeCollections
                            collections={collections}
                            activeSort=""
                            user={user}
                            selectedCollection={selectedCollection}
                            setSelectedCollection={setSelectedCollection}
                        />
                    )}
                </div>
            </Dialog>

            <CollectionsVoteReceivedModal
                isOpen={showConfirmationDialog}
                onClose={() => {
                    setShowConfirmationDialog(false);
                    setSelectedCollection(0);
                }}
                collection={collection}
            />
        </>
    );
};
