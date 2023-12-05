import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CollectionOfTheMonthCandidatesTable } from "./CollectionOfTheMonthCandidatesTable";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { SearchInput } from "@/Components/Form/SearchInput";

const NominationDialogFooter = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="w-full border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:flex sm:flex-row sm:justify-end">
            <div className="flex flex-row items-center justify-center gap-3 sm:w-fit">
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        setIsOpen(false);
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
                    disabled={true}
                    className="w-full items-end justify-center"
                >
                    {t("common.confirm")}
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
    collections: App.Data.Collections.PopularCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>("");

    return (
        <Dialog
            title={t("pages.collections.vote.or_nominate_collection")}
            isOpen={isOpen}
            onClose={(): void => {
                setIsOpen(false);
            }}
            panelClassName="md:max-w-[640px]"
            footer={<NominationDialogFooter setIsOpen={setIsOpen} />}
        >
            <div className="flex flex-col md:gap-0">
                <SearchInput
                    placeholder={t("pages.collections.search_placeholder")}
                    query={query}
                    onChange={setQuery}
                />

                <CollectionOfTheMonthCandidatesTable
                    collections={collections}
                    activeSort=""
                    user={user}
                />
            </div>
        </Dialog>
    );
};
