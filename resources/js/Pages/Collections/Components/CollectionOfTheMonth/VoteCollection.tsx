import React from "react";
import { useTranslation } from "react-i18next";
import { VoteCountdown } from "./VoteCountdown";
import { Heading } from "@/Components/Heading";

export const VoteCollection = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-col gap-4 rounded-xl border-theme-secondary-300 p-0 dark:border-theme-dark-700 lg:border lg:p-8">
            <Heading level={2}>{t("pages.collections.vote.vote_for_top_collection")}</Heading>

            <VoteCountdown />
        </div>
    );
};
