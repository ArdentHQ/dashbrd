import { type PageProps, router } from "@inertiajs/core";
import { Head } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { WinnersChart } from "@/Components/Collections/CollectionOfTheMonthWinners";
import { Link } from "@/Components/Link";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface CollectionOfTheMonthProperties extends PageProps {
    title: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}

const CollectionOfTheMonth = ({ title, collections }: CollectionOfTheMonthProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <DefaultLayout wrapperClassName="-mt-6 sm:-mt-8 lg:mt-0 -mb-6 sm:-mb-8 lg:mb-0">
            <Head title={title} />

            <div className="flex items-center">
                <IconButton
                    icon="ChevronLeftSmall"
                    onClick={() => {
                        router.get(route("collections"));
                    }}
                    iconSize="xs"
                    className="mr-3 text-theme-dark-300"
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

            <div className="flex flex-col border border-theme-secondary-300 dark:border-theme-dark-700">
                <div className="collection-of-the-month-overview flex justify-center">
                    <WinnersChart
                        winners={collections}
                        large
                    />
                </div>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae rerum exercitationem qui numquam
                dicta. Dicta dignissimos ratione ut maxime eligendi nisi iusto minus aliquam porro enim reprehenderit,
                illum labore ea.
            </div>
        </DefaultLayout>
    );
};

export default CollectionOfTheMonth;
