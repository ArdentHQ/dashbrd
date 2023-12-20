/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { WinnersChart, WinnersChartMobile } from "./CollectionOfTheMonthWinners.blocks";
import { Heading } from "@/Components/Heading";
import { Link } from "@/Components/Link";

export const CollectionOfTheMonthWinners = ({
    className,
    winners,
}: {
    className?: string;
    winners: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => {
    const { t } = useTranslation();

    const showWinners = winners.length > 0;

    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const previousMonth = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

    return (
        <>
            {winners.length > 0 && (
                <WinnersChartMobile
                    winner={winners[0]}
                    previousMonth={previousMonth}
                />
            )}

            <div
                data-testid="CollectionOfTheMonthWinners"
                className={cn(
                    "dark:border-dark-700 hidden min-h-[516px] w-full max-w-[419px] flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-gradient-to-b from-theme-secondary-300 to-theme-primary-50 dark:border-theme-dark-700 dark:from-theme-dark-800 dark:to-theme-dark-700 xl:flex",
                    className,
                )}
            >
                <div className="shadow-collection-of-the-month flex justify-center bg-white px-8 py-4 dark:bg-theme-dark-900">
                    <Heading
                        level={3}
                        className="text-center"
                    >
                        {showWinners
                            ? t("pages.collections.collection_of_the_month.winners_month", {
                                  month: previousMonth,
                              })
                            : t("pages.collections.collection_of_the_month.vote_for_next_months_winners")}
                    </Heading>
                </div>

                <div
                    className={cn("flex flex-1 justify-center", {
                        "items-end": winners.length > 0,
                        "items-center": winners.length === 0,
                    })}
                >
                    <WinnersChart winners={winners} />
                </div>

                {showWinners && (
                    <div className="shadow-collection-of-the-month-footer flex justify-center bg-white px-8 py-4 dark:bg-theme-dark-900">
                        <Link
                            variant="link"
                            textColor="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500"
                            href={route("collection-of-the-month")}
                            fontSize="text-base"
                        >
                            {t("pages.collections.collection_of_the_month.view_previous_winners")}
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};
