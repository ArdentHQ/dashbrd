/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
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

const WinnersChartWrapper = ({
    children,
    chart,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    chart: JSX.Element;
    className?: string;
}): JSX.Element => (
    <div className="relative h-[428px] overflow-hidden">
        <div className="relative bottom-[-50px]">{chart}</div>
        <div className={cn("absolute left-0 right-0 flex", className)}>{children}</div>
    </div>
);

const WinnersChart = ({ winners }: { winners: App.Data.Collections.PopularCollectionData[] }): JSX.Element => {
    const { isDark } = useDarkModeContext();

    if (winners.length === 1) {
        return (
            <WinnersChartWrapper
                className="justify-center"
                chart={isDark ? <OneBarChartDark /> : <OneBarChart />}
            >
                <div className={cn("relative bottom-[346px]")}>
                    <Img
                        wrapperClassName="aspect-square h-20 w-20"
                        className="rounded-full"
                        src={winners[0].image}
                        isCircle
                    />
                </div>
            </WinnersChartWrapper>
        );
    }

    if (winners.length === 2) {
        return (
            <WinnersChartWrapper
                className="justify-between px-18"
                chart={isDark ? <TwoBarChartDark /> : <TwoBarChart />}
            >
                {[winners[0], winners[1]].map((winner, index) => (
                    <div
                        className={cn("relative", {
                            "bottom-[346px]": index === 0,
                            "bottom-[298px]": index === 1,
                        })}
                        key={index}
                    >
                        <Img
                            wrapperClassName="aspect-square h-20 w-20"
                            className="rounded-full"
                            src={winner.image}
                            isCircle
                        />
                    </div>
                ))}
            </WinnersChartWrapper>
        );
    }

    if (winners.length === 3) {
        return (
            <WinnersChartWrapper
                className="justify-between px-12"
                chart={isDark ? <ThreeBarChartDark /> : <ThreeBarChart />}
            >
                {[winners[1], winners[0], winners[2]].map((winner, index) => (
                    <div
                        className={cn("relative", {
                            "bottom-[295px]": index === 0,
                            "bottom-[346px]": index === 1,
                            "bottom-[268px]": index === 2,
                        })}
                        key={index}
                    >
                        <Img
                            wrapperClassName="aspect-square h-20 w-20"
                            className="rounded-full"
                            src={winner.image}
                            isCircle
                        />
                    </div>
                ))}
            </WinnersChartWrapper>
        );
    }

    if (isDark) {
        return <VoteNextMonthWinnersDark />;
    }

    return <VoteNextMonthWinners />;
};

export const CollectionOfTheMonthWinners = ({
    className,
    winners,
}: {
    className?: string;
    // Depending on how we get the data the type may change
    winners: App.Data.Collections.PopularCollectionData[];
}): JSX.Element => {
    const { t } = useTranslation();

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

            <div className="flex flex-1 items-center justify-center">
                <WinnersChart winners={winners} />
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
