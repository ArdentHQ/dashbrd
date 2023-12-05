/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import {
    CrownBadge,
    CrownBadgeDark,
    OneBarChart,
    OneBarChartDark,
    ThreeBarChart,
    ThreeBarChartDark,
    TwoBarChart,
    TwoBarChartDark,
    VoteNextMonthWinners,
    VoteNextMonthWinnersDark,
} from "@/images";
import { formatNumbershort } from "@/Utils/format-number";

const WinnersChartWrapper = ({
    children,
    chart,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    chart: JSX.Element;
    className?: string;
}): JSX.Element => (
    <div className="relative overflow-hidden">
        <div className="relative">{chart}</div>
        <div className={cn("absolute left-0 right-0 flex", className)}>{children}</div>
    </div>
);

export const WinnersChart = ({
    winners,
    large = false,
}: {
    winners: App.Data.Collections.CollectionOfTheMonthData[];
    large?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();

    if (winners.length === 1) {
        return (
            <WinnersChartWrapper
                className="justify-center"
                chart={
                    isDark ? (
                        <OneBarChartDark
                            className={cn({
                                "w-[155px]": !large,
                                "w-[239px]": large,
                            })}
                        />
                    ) : (
                        <OneBarChart
                            className={cn({
                                "w-[155px]": !large,
                                "w-[239px]": large,
                            })}
                        />
                    )
                }
            >
                <div className={cn("relative bottom-[346px] left-px flex flex-col items-center space-y-[124px]")}>
                    <Img
                        wrapperClassName="aspect-square h-20 w-20"
                        className="rounded-full"
                        src={winners[0].image}
                        isCircle
                    />

                    <span className="text-center text-base font-medium leading-4.5 text-white">
                        {formatNumbershort(winners[0].votes)}
                        <br /> {t("common.votes")}
                    </span>
                </div>
            </WinnersChartWrapper>
        );
    }

    if (winners.length === 2) {
        return (
            <WinnersChartWrapper
                className="justify-between px-[38px]"
                chart={
                    isDark ? (
                        <TwoBarChartDark
                            className={cn({
                                "w-[310px]": !large,
                                "w-[356px]": large,
                            })}
                        />
                    ) : (
                        <TwoBarChart
                            className={cn({
                                "w-[310px]": !large,
                                "w-[356px]": large,
                            })}
                        />
                    )
                }
            >
                {winners.map((winner, index) => (
                    <div
                        className={cn("relative flex flex-col items-center space-y-[124px]", {
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

                        <span className="text-center text-base font-medium leading-4.5 text-white">
                            {formatNumbershort(winner.votes)}
                            <br /> {t("common.votes")}
                        </span>
                    </div>
                ))}
            </WinnersChartWrapper>
        );
    }

    if (winners.length === 3) {
        return (
            <WinnersChartWrapper
                className="justify-between px-4"
                chart={
                    isDark ? (
                        <ThreeBarChartDark
                            className={cn({
                                "w-[357px]": !large,
                                "w-[512px]": large,
                            })}
                        />
                    ) : (
                        <ThreeBarChart
                            className={cn({
                                "w-[357px]": !large,
                                "w-[512px]": large,
                            })}
                        />
                    )
                }
            >
                {[winners[1], winners[0], winners[2]].map((winner, index) => (
                    <div
                        className={cn("relative flex flex-col items-center space-y-[124px]", [
                            large
                                ? {}
                                : {
                                      "bottom-[295px]": index === 0,
                                      "bottom-[346px] left-[2px]": index === 1,
                                      "bottom-[268px]": index === 2,
                                  },
                        ])}
                        key={index}
                    >
                        <Img
                            wrapperClassName="aspect-square h-20 w-20"
                            className="rounded-full"
                            src={winner.image}
                            isCircle
                        />

                        <span className="text-center text-base font-medium leading-4.5 text-white">
                            {formatNumbershort(winner.votes)}
                            <br /> {t("common.votes")}
                        </span>
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

const WinnersChartMobile = ({
    winner,
    currentMonth,
}: {
    winner: App.Data.Collections.CollectionOfTheMonthData;
    currentMonth?: string;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();
    const { t } = useTranslation();

    return (
        <div className="mt-6 border-t border-theme-secondary-300 pt-6 dark:border-theme-dark-700 xl:hidden">
            <div className="collection-of-the-month-mobile flex flex-col items-center rounded-xl px-4 py-3 sm:flex-row sm:justify-between  ">
                <div className="flex flex-col items-center space-y-3.5 sm:flex-row sm:space-x-3.5 sm:space-y-0">
                    <div className="flex">
                        <div className="relative">
                            <Img
                                wrapperClassName="aspect-square h-10 w-10 "
                                className="rounded-full"
                                src={winner.image}
                                isCircle
                            />
                        </div>

                        <div className="relative -my-1 -ml-2.5 rounded-full bg-[#eef] p-1 dark:bg-theme-dark-800">
                            {isDark ? <CrownBadgeDark /> : <CrownBadge />}
                        </div>
                    </div>

                    <span className="collection-of-the-month-legend text-lg font-medium">
                        {t("pages.collections.collection_of_the_month.winners_month", {
                            month: currentMonth,
                        })}
                    </span>
                </div>

                <Link
                    variant="link"
                    textColor="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500"
                    href="/"
                    fontSize="text-base"
                >
                    {t("pages.collections.collection_of_the_month.view_previous_winners")}
                </Link>
            </div>
        </div>
    );
};

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
    const currentMonth = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

    return (
        <>
            {winners.length > 0 && (
                <WinnersChartMobile
                    winner={winners[0]}
                    currentMonth={currentMonth}
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
                                  month: currentMonth,
                              })
                            : t("pages.collections.collection_of_the_month.vote_for_next_months_winners")}
                    </Heading>
                </div>

                <div className="flex flex-1 items-end justify-center">
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
        </>
    );
};
