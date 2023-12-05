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
    OneBarChartDark,
    OneBarChartLg,
    OneBarChartLgDark,
    ThreeBarChart,
    ThreeBarChartDark,
    ThreeBarChartLg,
    ThreeBarChartLgDark,
    TwoBarChart,
    TwoBarChartDark,
    TwoBarChartLg,
    TwoBarChartLgDark,
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
    <div className="relative flex w-full items-end justify-center overflow-hidden">
        <div className="relative">{chart}</div>
        <div className={cn("absolute inset-0 flex items-end", className)}>{children}</div>
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
        const lightChart = large ? <OneBarChartLg /> : <OneBarChartDark />;
        const darkChart = large ? <OneBarChartLgDark /> : <OneBarChartDark />;

        return (
            <WinnersChartWrapper
                className="justify-center"
                chart={isDark ? darkChart : lightChart}
            >
                <div
                    className={cn("relative bottom-[107px] flex flex-col items-center", {
                        "space-y-[124px]": !large,
                        "space-y-[174px]": large,
                    })}
                >
                    <Img
                        wrapperClassName={cn("aspect-square", {
                            "h-20 w-20": !large,
                            "h-[115px] w-[115px]": large,
                        })}
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
        const lightChart = large ? <TwoBarChartLg /> : <TwoBarChart />;
        const darkChart = large ? <TwoBarChartLgDark /> : <TwoBarChartDark />;

        return (
            <WinnersChartWrapper
                className="justify-between px-[91px]"
                chart={isDark ? darkChart : lightChart}
            >
                {winners.map((winner, index) => (
                    <div
                        className={cn(
                            "relative flex flex-col items-center",
                            {
                                "space-y-[124px]": !large,
                                "space-y-[174px]": large,
                            },
                            [
                                large
                                    ? {
                                          "bottom-[107px]": index === 0,
                                          "bottom-[59px]": index === 1,
                                      }
                                    : {
                                          "bottom-[107px]": index === 0,
                                          "bottom-[59px]": index === 1,
                                      },
                            ],
                        )}
                        key={index}
                    >
                        <Img
                            wrapperClassName={cn("aspect-square", {
                                "h-20 w-20": !large,
                                "h-[115px] w-[115px]": large,
                            })}
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
        const lightChart = large ? <ThreeBarChartLg /> : <ThreeBarChart />;
        const darkChart = large ? <ThreeBarChartLgDark /> : <ThreeBarChartDark />;

        return (
            <WinnersChartWrapper
                className={cn("justify-between", {
                    "px-[17px]": large,
                    "px-8": !large,
                })}
                chart={isDark ? darkChart : lightChart}
            >
                {[winners[1], winners[0], winners[2]].map((winner, index) => (
                    <div
                        className={cn(
                            "relative flex flex-col items-center",
                            {
                                "space-y-[124px]": !large,
                                "space-y-[174px]": large,
                            },
                            [
                                large
                                    ? {
                                          "bottom-[92px]": index === 0,
                                          "bottom-[165px]": index === 1,
                                          "bottom-[53px] right-[9px]": index === 2,
                                      }
                                    : {
                                          "bottom-[56px]": index === 0,
                                          "bottom-[107px]": index === 1,
                                          "bottom-[29px]": index === 2,
                                      },
                            ],
                        )}
                        key={index}
                    >
                        <Img
                            wrapperClassName={cn("aspect-square relative", {
                                "h-20 w-20": !large,
                                "h-[115px] w-[115px]": large,
                                "left-[7px]": large && index === 0,
                            })}
                            className="rounded-full"
                            src={winner.image}
                            isCircle
                        />

                        <span
                            className={cn("relative text-center text-white", {
                                "text-base font-medium leading-4.5": !large,
                                "text-xl font-bold leading-6": large,
                                "right-[5px]": large && index === 2,
                            })}
                        >
                            {formatNumbershort(1246)}
                            {/* {formatNumbershort(winner.votes)} */}
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
                    href={route("collection-of-the-month")}
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
