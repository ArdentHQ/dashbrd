/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    CollectionOfTheMonthWinnersChart,
    CollectionOfTheMonthWinnersChartWrapper,
    CollectionOfTheMonthWinnersCollectionAvatar,
    CollectionOfTheMonthWinnersVotesLabel,
    CollectionOfTheMonthWinnersWinnerWrapper,
} from "./CollectionOfTheMonthWinners.blocks";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { CrownBadge, CrownBadgeDark, VoteNextMonthWinners, VoteNextMonthWinnersDark } from "@/images";

export const WinnersChart = ({
    winners,
    large = false,
}: {
    winners: App.Data.Collections.CollectionOfTheMonthData[];
    large?: boolean;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();

    if (winners.length === 0) {
        if (isDark) {
            return <VoteNextMonthWinnersDark />;
        }

        return <VoteNextMonthWinners />;
    }

    const totalWinners: 1 | 2 | 3 = winners.length as 1 | 2 | 3;

    const chart = (
        <CollectionOfTheMonthWinnersChart
            large={large}
            totalWinners={totalWinners}
        />
    );

    if (totalWinners === 1) {
        return (
            <CollectionOfTheMonthWinnersChartWrapper
                className="justify-center"
                chart={chart}
            >
                <CollectionOfTheMonthWinnersWinnerWrapper
                    className={cn({
                        "bottom-[107px] space-y-[124px]": !large,
                        "bottom-[61px] space-y-[70px] sm:bottom-[164px] sm:space-y-[174px]": large,
                    })}
                >
                    <CollectionOfTheMonthWinnersCollectionAvatar
                        image={winners[0].image}
                        large={large}
                    />

                    <CollectionOfTheMonthWinnersVotesLabel
                        votes={winners[0].votes}
                        large={large}
                    />
                </CollectionOfTheMonthWinnersWinnerWrapper>
            </CollectionOfTheMonthWinnersChartWrapper>
        );
    }

    if (totalWinners === 2) {
        return (
            <CollectionOfTheMonthWinnersChartWrapper
                className={cn("justify-between", {
                    "px-[91px]": !large,
                })}
                chart={chart}
            >
                {winners.map((winner, index) => (
                    <CollectionOfTheMonthWinnersWinnerWrapper
                        className={cn(
                            {
                                "space-y-[124px]": !large,
                                "space-y-[76px] sm:space-y-[174px]": large,
                            },
                            [
                                large
                                    ? {
                                          "bottom-[70px] left-[15px] sm:bottom-[164px] sm:left-[36px]": index === 0,
                                          "bottom-[38px] right-[13px] sm:bottom-[90px] sm:right-[26px]": index === 1,
                                      }
                                    : {
                                          "bottom-[107px]": index === 0,
                                          "bottom-[59px]": index === 1,
                                      },
                            ],
                        )}
                        key={index}
                    >
                        <CollectionOfTheMonthWinnersCollectionAvatar
                            image={winner.image}
                            large={large}
                        />

                        <CollectionOfTheMonthWinnersVotesLabel
                            className={cn("relative text-center text-white", {
                                "left-[3px]": large && index === 0,
                                "left-[2px] sm:right-[2px]": large && index === 1,
                            })}
                            votes={winner.votes}
                            large={large}
                        />
                    </CollectionOfTheMonthWinnersWinnerWrapper>
                ))}
            </CollectionOfTheMonthWinnersChartWrapper>
        );
    }

    return (
        <CollectionOfTheMonthWinnersChartWrapper
            className={cn("justify-between", {
                "px-12": !large,
            })}
            chart={chart}
        >
            {[winners[1], winners[0], winners[2]].map((winner, index) => (
                <CollectionOfTheMonthWinnersWinnerWrapper
                    className={cn(
                        {
                            "space-y-[124px]": !large,
                            "space-y-[76px] sm:space-y-[174px]": large,
                        },
                        [
                            large
                                ? {
                                      "bottom-[37px] left-[9px] sm:bottom-[90px] sm:left-[23px]": index === 0,
                                      "bottom-[70px] sm:bottom-[163px]": index === 1,
                                      "bottom-[19px] left-[-11px] sm:bottom-[51px] sm:right-[22px]": index === 2,
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
                    <CollectionOfTheMonthWinnersCollectionAvatar
                        image={winner.image}
                        large={large}
                    />

                    <CollectionOfTheMonthWinnersVotesLabel
                        className={cn("relative text-center text-white", {
                            "sm:left-[-4px] ": large && index === 0,
                            "left-[1px] ": large && index === 1,
                            "left-[-2px] sm:left-[-19px] ": large && index === 2,
                        })}
                        votes={winner.votes}
                        large={large}
                    />
                </CollectionOfTheMonthWinnersWinnerWrapper>
            ))}
        </CollectionOfTheMonthWinnersChartWrapper>
    );
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
