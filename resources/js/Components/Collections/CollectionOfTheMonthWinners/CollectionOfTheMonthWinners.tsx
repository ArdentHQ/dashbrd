import React from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { VoteNextMonthWinners, VoteNextMonthWinnersDark } from "@/images";

export const CollectionOfTheMonthWinners = (): JSX.Element => {
    const { t } = useTranslation();

    const { isDark } = useDarkModeContext();

    return (
        <div
            data-testid="CollectionOfTheMonthWinners"
            className="dark:border-dark-700 flex w-full max-w-[419px] flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-gradient-to-b from-theme-secondary-300 to-theme-primary-50 dark:border-theme-dark-700 dark:from-theme-dark-800 dark:to-theme-dark-700"
        >
            <div className="shadow-collection-of-the-month flex justify-center bg-white px-8 py-4 dark:bg-theme-dark-900">
                <Heading
                    level={3}
                    className="text-center"
                >
                    {t("pages.collections.collection_of_the_month.vote_for_next_months_winners")}
                </Heading>
            </div>
            <div className="flex flex-1 items-center justify-center ">
                {isDark ? <VoteNextMonthWinnersDark /> : <VoteNextMonthWinners />}
            </div>
        </div>
    );
};
