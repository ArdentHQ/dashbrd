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

export const WinnerCollectionsEmptyBlock = () => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center border-t border-theme-secondary-300 p-8 dark:border-theme-dark-700 sm:min-h-[262px]">
            <div className="flex max-w-[230px] flex-col items-center text-center">
                <div className="mb-3 flex h-[42px] w-[42px] items-center justify-center rounded-full border border-theme-secondary-300 dark:border-theme-dark-700">
                    <Icon
                        name="Clock"
                        className="text-theme-secondary-700 dark:text-theme-dark-300"
                        size="lg"
                    />
                </div>

                <Heading
                    level={3}
                    className="text-theme-secondary-700 dark:text-theme-dark-200"
                >
                    {t("pages.collections.collection_of_the_month.content_to_be_added.title")}
                </Heading>

                <p className="text-theme-secondary-700 dark:text-theme-dark-200">
                    {t("pages.collections.collection_of_the_month.content_to_be_added.description")}
                </p>
            </div>
        </div>
    );
};

export const WinnerCollectionsList = ({ month }: { month: string }) => {
    const { t } = useTranslation();

    return (
        <div className="border-t border-theme-secondary-300 dark:border-theme-dark-700">
            <div className="p-8">
                <Heading level={4}>
                    {t("pages.collections.collection_of_the_month.winners_month", {
                        month,
                    })}
                </Heading>

                <div className="mt-4 rounded-md border border-theme-secondary-300 dark:border-theme-dark-700">
                    {[1, 2, 3].map((key) => (
                        <WinnerCollectionRow
                            index={key}
                            image="https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format"
                            name="jfs ajfkas jfsla fjlskjfksl fkjlsd jfksldfj sklf jlskfjs"
                            key={key}
                            floorPrice="0.01231232312 ETH"
                            volume="0.01231232312 ETH"
                            votes="1.7k"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
