import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import {
    CrownBadge,
    CrownBadgeDark,
    OneBarChart,
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

export const CollectionOfTheMonthWinnersChartWrapper = ({
    children,
    chart,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    chart: JSX.Element;
    className?: string;
}): JSX.Element => (
    <div
        data-testid="WinnersChart"
        className="relative flex w-full items-end justify-center overflow-hidden"
    >
        <div className="relative">{chart}</div>
        <div className={cn("absolute inset-0 flex items-end", className)}>{children}</div>
    </div>
);
export const CollectionOfTheMonthWinnersWinnerWrapper = ({
    children,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    className?: string;
}): JSX.Element => <div className={cn("relative flex flex-col items-center", className)}>{children}</div>;

export const CollectionOfTheMonthWinnersCollectionAvatar = ({
    image,
    large,
}: {
    image: string | null;
    large: boolean;
}): JSX.Element => (
    <Img
        wrapperClassName={cn("aspect-square relative", {
            "h-20 w-20": !large,
            "sm:h-[115px] sm:w-[115px] w-[52px] h-[52px]": large,
        })}
        className="rounded-full"
        src={image}
        isCircle
    />
);

export const CollectionOfTheMonthWinnersChart = ({
    large,
    totalWinners,
}: {
    large: boolean;
    totalWinners: 1 | 2 | 3;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();

    const charts = {
        1: {
            large: {
                dark: <OneBarChartLgDark className="h-auto w-[100px] sm:w-auto" />,
                light: <OneBarChartLg className="h-auto w-[100px] sm:w-auto" />,
            },
            small: {
                dark: <OneBarChartDark />,
                light: <OneBarChart />,
            },
        },
        2: {
            large: {
                dark: <TwoBarChartLgDark className="h-auto w-[160px] sm:w-auto" />,
                light: <TwoBarChartLg className="h-auto w-[160px] sm:w-auto" />,
            },
            small: {
                dark: <TwoBarChartDark />,
                light: <TwoBarChart />,
            },
        },
        3: {
            large: {
                dark: <ThreeBarChartLgDark className="h-auto w-[230px] sm:w-auto" />,
                light: <ThreeBarChartLg className="h-auto w-[230px] sm:w-auto" />,
            },
            small: {
                dark: <ThreeBarChartDark />,
                light: <ThreeBarChart />,
            },
        },
    };

    if (large) {
        return charts[totalWinners].large[isDark ? "dark" : "light"];
    }

    return charts[totalWinners].small[isDark ? "dark" : "light"];
};

export const CollectionOfTheMonthWinnersVotesLabel = ({
    large,
    votes,
    className,
}: {
    large: boolean;
    votes: number;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <span
            className={cn(
                "relative text-center text-white",
                {
                    "text-base font-medium leading-4.5": !large,
                    "text-xs font-bold leading-[14px] sm:text-xl sm:leading-6": large,
                },
                className,
            )}
        >
            {formatNumbershort(votes)}
            <br /> {t("common.votes")}
        </span>
    );
};

export const WinnersChart = ({
    winners,
    large = false,
}: {
    winners: App.Data.Collections.CollectionWinnersData;
    large?: boolean;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();

    if (winners.winners.length === 0) {
        if (isDark) {
            return <VoteNextMonthWinnersDark />;
        }

        return <VoteNextMonthWinners />;
    }

    const totalWinners: 1 | 2 | 3 = winners.winners.length as 1 | 2 | 3;

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
                        image={winners.winners[0].image}
                        large={large}
                    />

                    <CollectionOfTheMonthWinnersVotesLabel
                        votes={winners.winners[0].votes}
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
                {winners.winners.map((winner, index) => (
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
            {[winners.winners[1], winners.winners[0], winners.winners[2]].map((winner, index) => (
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
                                      "bottom-[19px] right-[11px] sm:bottom-[51px] sm:right-[22px]": index === 2,
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
                            "right-[2px] sm:right-[8px] ": large && index === 2,
                        })}
                        votes={winner.votes}
                        large={large}
                    />
                </CollectionOfTheMonthWinnersWinnerWrapper>
            ))}
        </CollectionOfTheMonthWinnersChartWrapper>
    );
};

export const WinnersChartMobile = ({
    winner,
    previousMonth,
}: {
    winner: App.Data.Collections.CollectionOfTheMonthData;
    previousMonth?: string;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();
    const { t } = useTranslation();

    return (
        <div className="lg:px-8 lg:pb-8 xl:hidden">
            <div className="mt-6 border-t border-theme-secondary-300 pt-6 dark:border-theme-dark-700">
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
                                month: previousMonth,
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
        </div>
    );
};
