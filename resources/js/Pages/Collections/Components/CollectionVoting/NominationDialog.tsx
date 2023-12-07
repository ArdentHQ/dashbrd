import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NomineeCollections } from "./NomineeCollections";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useDebounce } from "@/Hooks/useDebounce";
import { type VoteCollectionProperties } from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";

const NominationDialogFooter = ({
    setIsOpen,
    selectedCollection,
    setSelectedCollection,
}: {
    setIsOpen: (isOpen: boolean) => void;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
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
                    onClick={(): void => {
                        console.log("TODO: implement");
                    }}
                    disabled={selectedCollection === 0}
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
    initialCollections: VoteCollectionProperties[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>("");
    const [selectedCollection, setSelectedCollection] = useState<number>(0);
    const [collections, setCollections] = useState(initialCollections);

    const [debouncedQuery] = useDebounce(query, 500);

    const searchCollections = async (): Promise<void> => {
        if (debouncedQuery.trim().length === 0) {
            setCollections(initialCollections);

            return;
        }

        const { data } = await axios.get<{
            collections: VoteCollectionProperties[];
        }>(route("nominatable-collections", { query: debouncedQuery }));

        setCollections(data.collections);
    };

    useEffect(() => {
        if (isOpen) {
            void searchCollections();
        }
    }, [debouncedQuery]);

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setCollections(initialCollections);
        }
    }, [isOpen]);

    return (
        <Dialog
            title={t("pages.collections.vote.or_nominate_collection")}
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
