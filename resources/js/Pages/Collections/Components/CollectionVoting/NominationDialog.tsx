import { router } from "@inertiajs/core";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NomineeCollections } from "./NomineeCollections";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { SearchInput } from "@/Components/Form/SearchInput";

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
    collections,
    user,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    collections: App.Data.Collections.VotableCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>("");
    const [selectedCollection, setSelectedCollection] = useState<number>(0);

    const collection = useMemo(
        () => collections.filter((c) => c.id === selectedCollection)[0],
        [collections, selectedCollection],
    );

    const [loading, setLoading] = useState(false);

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
            panelClassName="md:max-w-[640px] md-lg:max-w-[720px] lg:max-w-[790px]"
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

                <NomineeCollections
                    collections={collections}
                    activeSort=""
                    user={user}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                />
            </div>
        </Dialog>
    );
};
