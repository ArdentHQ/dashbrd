import { type PageProps, router } from "@inertiajs/core";
import { Head } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { WinnersChart } from "@/Components/Collections/CollectionOfTheMonthWinners/CollectionOfTheMonthWinners.blocks";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { Img } from "@/Components/Image";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { WinnerBadgeFirst, WinnerBadgeSecond, WinnerBadgeThird } from "@/images";

const WinnerCollectionLabel = ({ label, value }: { label: string; value: string }) => {
    return (
        <p className="flex w-full justify-between space-x-1 whitespace-nowrap text-sm font-medium sm:w-auto">
            <span className="text-theme-secondary-700 dark:text-theme-dark-200 ">{label}</span>
            <span className="text-theme-secondary-900 dark:text-theme-dark-50">{value}</span>
        </p>
    );
};

export const WinnerCollectionRow = ({
    floorPrice,
    volume,
    votes,
    name,
    image,
    index,
}: {
    name: string;
    votes: string;
    volume: string;
    floorPrice: string;
    image?: string;
    index: number;
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-end border-t border-theme-secondary-300 p-4 first:border-none dark:border-theme-dark-700 lg:flex-row">
            <div className="flex w-full items-center space-x-3 overflow-hidden">
                <div className="flex items-center justify-start -space-x-2">
                    <Img
                        wrapperClassName="h-12 w-12"
                        className="rounded-full"
                        src={image}
                    />

                    {index === 1 && (
                        <WinnerBadgeFirst className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {index === 2 && (
                        <WinnerBadgeSecond className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {index === 3 && (
                        <WinnerBadgeThird className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}
                </div>

                <p
                    className={cn(
                        "w-full truncate text-sm font-medium text-theme-secondary-900 dark:text-theme-dark-50",
                    )}
                >
                    {name}
                </p>
            </div>

            <div className="mt-4 flex w-full flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 md:space-x-16 lg:mt-0 lg:justify-end">
                <WinnerCollectionLabel
                    label={t("common.volume")}
                    value={volume}
                />

                <WinnerCollectionLabel
                    label={t("common.floor_price")}
                    value={floorPrice}
                />

                <WinnerCollectionLabel
                    label={t("common.votes")}
                    value={votes}
                />
            </div>
        </div>
    );
};
