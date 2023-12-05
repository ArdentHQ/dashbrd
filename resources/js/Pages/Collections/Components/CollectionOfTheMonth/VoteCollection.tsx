import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NominationDialog } from "./NominationDialog";
import { VoteCountdown } from "./VoteCountdown";
import { Heading } from "@/Components/Heading";
import { LinkButton } from "@/Components/Link";

export const VoteCollection = ({
    collections,
    user,
}: {
    collections: App.Data.Collections.PopularCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    return (
        <div className="flex w-full flex-col gap-4 rounded-xl border-theme-secondary-300 p-0 dark:border-theme-dark-700 lg:border lg:p-8">
            <Heading level={2}>{t("pages.collections.vote.vote_for_top_collection")}</Heading>

            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <VoteCountdown />

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
            </div>

            <NominationDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                collections={collections}
                user={user}
            />
        </div>
    );
};