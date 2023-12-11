import { type PageProps, router } from "@inertiajs/core";
import { Head } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { WinnerCollections } from "./Components/WinnerCollections";
import { IconButton } from "@/Components/Buttons";
import { WinnersChart } from "@/Components/Collections/CollectionOfTheMonthWinners/CollectionOfTheMonthWinners.blocks";
import { Heading } from "@/Components/Heading";
import { Link } from "@/Components/Link";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface CollectionOfTheMonthProperties extends PageProps {
    title: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
    winners: App.Data.Collections.CollectionOfTheMonthData[];
}

const CollectionOfTheMonth = ({ title, collections, winners }: CollectionOfTheMonthProperties): JSX.Element => {
    const { t } = useTranslation();

    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const previousMonth = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

    return (
        <DefaultLayout>
            <Head title={title} />

            <div className="lg:mx-8 2xl:mx-0">
                <div className="-mb-4 -mt-6 flex items-center bg-theme-hint-50 px-8 py-4 dark:bg-theme-dark-800 sm:-mt-8 lg:mb-0  lg:mt-0 lg:bg-transparent lg:px-0 lg:py-0 dark:lg:bg-transparent ">
                    <IconButton
                        icon="ChevronLeftSmall"
                        onClick={() => {
                            router.get(route("collections"));
                        }}
                        iconSize="xs"
                        className="mr-3 h-6 w-6 bg-transparent text-theme-dark-300 lg:h-10 lg:w-10"
                    />

                    <span>
                        <span className="font-medium text-theme-secondary-700 dark:text-theme-dark-200">
                            {t("common.back_to")}{" "}
                        </span>
                        <Link
                            href={route("collections")}
                            className={cn(
                                "transition-default font-medium text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none",
                                "hover:text-theme-primary-700 hover:decoration-theme-primary-700",
                                "focus-visible:decoration-theme-primary-700",
                                "dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500",
                            )}
                        >
                            {t("common.collections")}
                        </Link>
                    </span>
                </div>

                <div className="mt-4 flex flex-col overflow-hidden border-theme-secondary-300 dark:border-theme-dark-700 sm:border-b sm:border-t lg:rounded-xl lg:border ">
                    <div className="collection-of-the-month-overview flex flex-col items-center justify-center pt-8">
                        <Heading level={1}>
                            {t("pages.collections.collection_of_the_month.winners_month", {
                                month: previousMonth,
                            })}
                        </Heading>
                        <div className="mt-11">
                            <WinnersChart
                                winners={collections}
                                large
                            />
                        </div>
                    </div>

                    <WinnerCollections collections={winners} />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default CollectionOfTheMonth;
