import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Dialog } from "@/Components/Dialog";
import { SearchInput } from "@/Components/Form/SearchInput";

const VoteDialogFooter = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="w-full border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700">
            <div className="flex flex-row items-center justify-center gap-3">
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
                    className="w-full justify-center"
                >
                    {t("common.confirm")}
                </Button>
            </div>
        </div>
    );
};

export const VoteDialog = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
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
            footer={<VoteDialogFooter setIsOpen={setIsOpen} />}
        >
            <div>
                <SearchInput
                    placeholder={t("pages.collections.search_placeholder")}
                    query={query}
                    onChange={setQuery}
                />
            </div>
        </Dialog>
    );
};

export default VoteDialog;
