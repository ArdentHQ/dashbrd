/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { Link } from "@/Components/Link";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import {
    OneBarChart,
    OneBarChartDark,
    ThreeBarChart,
    ThreeBarChartDark,
    TwoBarChart,
    TwoBarChartDark,
    VoteNextMonthWinners,
    VoteNextMonthWinnersDark,
} from "@/images";

const CharBar = ({ place, votes }: { place: 1 | 2 | 3; votes: number }): JSX.Element => (
    <div className="flex flex-col items-center text-white">
        <OneBarChart />
        <OneBarChartDark />
        <TwoBarChart />
        <TwoBarChartDark />
        <ThreeBarChart />
        <ThreeBarChartDark />
        {/* <span className="text-[56px] font-bold leading-[100px]">{place}</span> */}
    </div>
);

export const CollectionOfTheMonthWinners = ({
    className,
    winners,
}: {
    className?: string;
    // Depending on how we get the data the type may change
    winners: App.Data.Collections.PopularCollectionData[];
}): JSX.Element => {
    const { t } = useTranslation();

    const { isDark } = useDarkModeContext();

    const showWinners = winners.length > 0;

    return (
        <div
            data-testid="CollectionOfTheMonthWinners"
            className={cn(
                "dark:border-dark-700 flex min-h-[516px] w-full max-w-[419px] flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-gradient-to-b from-theme-secondary-300 to-theme-primary-50 dark:border-theme-dark-700 dark:from-theme-dark-800 dark:to-theme-dark-700",
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
                              // @TODO: Make this dynamic
                              month: "August 2023",
                          })
                        : t("pages.collections.collection_of_the_month.vote_for_next_months_winners")}
                </Heading>
            </div>
            <div className="flex flex-1 items-center justify-center ">
                {showWinners ? (
                    <div className="flex ">
                        <CharBar
                            place={1}
                            votes={123456}
                        ></CharBar>
                        <CharBar
                            place={2}
                            votes={35}
                        ></CharBar>
                        <CharBar
                            place={3}
                            votes={3532532}
                        ></CharBar>
                    </div>
                ) : (
                    <>{isDark ? <VoteNextMonthWinnersDark /> : <VoteNextMonthWinners />}</>
                )}
            </div>

            {showWinners && (
                <div className="shadow-collection-of-the-month-footer flex justify-center bg-white px-8 py-4 dark:bg-theme-dark-900">
                    <Link
                        variant="link"
                        textColor="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500"
                        href="/"
                        fontSize="text-base"
                    >
                        {t("pages.collections.collection_of_the_month.view_previous_winners")}
                    </Link>
                </div>
            )}
        </div>
    );
};
