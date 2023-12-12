import { router } from "@inertiajs/core";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { NomineeCollections } from "./NomineeCollections";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { LoadingBlock } from "@/Components/LoadingBlock/LoadingBlock";
import { useDebounce } from "@/Hooks/useDebounce";

const NominationDialogFooter = ({
    setIsOpen,
    selectedCollection,
    setSelectedCollection,
    onSubmit,
    isDisabled,
}: {
    setIsOpen: (isOpen: boolean) => void;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
    onSubmit: () => void;
    isDisabled: boolean;
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

                <Button
                    variant="primary"
                    onClick={onSubmit}
                    disabled={selectedCollection === 0 || isDisabled}
                    className="w-full items-end justify-center md:px-8"
                >
                    {t("common.vote")}
                </Button>
            </div>
        </div>
    );
};

export const NominationDialog = ({
    isOpen,
    setIsOpen,
    initialCollections,
    user,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialCollections: App.Data.Collections.VotableCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const [collections, setCollections] = useState(initialCollections);

    const [debouncedQuery] = useDebounce(query, 500);

    const searchCollections = async (): Promise<void> => {
        setSelectedCollection(0);

        if (debouncedQuery.trim().length === 0) {
            setCollections(initialCollections);

            return;
        }

        setLoading(true);

        const { data } = await axios.get<{
            collections: App.Data.Collections.VotableCollectionData[];
        }>(route("nominatable-collections", { query: debouncedQuery }));

        setCollections(data.collections);
        setLoading(false);
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
        }
    }, [isOpen]);

    const collection = useMemo(
        () => collections.filter((c) => c.id === selectedCollection)[0],
        [collections, selectedCollection],
    );

    const vote = (): void => {
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
                },
            },
        );
    };

    return (
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
                    isDisabled={loading}
                />
            }
        >
            <div className="flex flex-col md:gap-0">
                <SearchInput
                    placeholder={t("pages.collections.search_placeholder")}
                    query={query}
                    onChange={setQuery}
                />

                {loading && (
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

                {collections.length === 0 && !loading && (
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

                {!loading && (
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
    );
};
