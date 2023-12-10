import cn from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "@/Components/Dropdown";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { DropdownButton } from "@/Components/SortDropdown";
import { WinnerBadgeFirst, WinnerBadgeSecond, WinnerBadgeThird } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

const WinnerCollectionLabel = ({ label, value }: { label: string; value: string | null }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <p className="flex w-full justify-between space-x-1 whitespace-nowrap text-sm font-medium sm:w-auto">
            <span className="text-theme-secondary-700 dark:text-theme-dark-200 ">{label}</span>

            {isTruthy(value) && <span className="text-theme-secondary-900 dark:text-theme-dark-50">{value}</span>}

            {!isTruthy(value) && (
                <span className="text-theme-secondary-900 dark:text-theme-dark-50">{t("common.na")}</span>
            )}
        </p>
    );
};

export const WinnerCollectionRow = ({
    index,
    collection,
}: {
    index: number;
    collection: App.Data.Collections.CollectionOfTheMonthData;
}): JSX.Element => {
    const { t } = useTranslation();
    console.log({ collection });

    return (
        <div className="flex flex-col items-center justify-end border-t border-theme-secondary-300 p-4 first:border-none dark:border-theme-dark-700 lg:flex-row">
            <div className="flex w-full items-center space-x-3 overflow-hidden">
                <div className="flex items-center justify-start -space-x-2">
                    <Img
                        wrapperClassName="h-12 w-12"
                        className="rounded-full"
                        src={collection.image}
                    />

                    {index === 0 && (
                        <WinnerBadgeFirst className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {index === 1 && (
                        <WinnerBadgeSecond className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {index === 2 && (
                        <WinnerBadgeThird className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}
                </div>

                <p
                    className={cn(
                        "w-full truncate text-sm font-medium text-theme-secondary-900 dark:text-theme-dark-50",
                    )}
                >
                    {collection.name}
                </p>
            </div>

            <div className="mt-4 flex w-full flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 md:space-x-16 lg:mt-0 lg:justify-end">
                <WinnerCollectionLabel
                    label={t("common.volume")}
                    value={collection.volume}
                />

                <WinnerCollectionLabel
                    label={t("common.floor_price")}
                    value={collection.floorPrice}
                />

                <WinnerCollectionLabel
                    label={t("common.votes")}
                    value={collection.votes.toString()}
                />
            </div>
        </div>
    );
};

export const WinnerCollectionsEmptyBlock = (): JSX.Element => {
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
                    level={4}
                    as="h3"
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

export const WinnerCollectionsList = ({
    month,
    collections,
}: {
    month: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => {
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
                    {collections.slice(0, 3).map((collection, key) => (
                        <WinnerCollectionRow
                            collection={collection}
                            index={key}
                            key={key}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const YearSelectionDropdown = ({
    onChange,
    options,
    selectedYear,
}: {
    onChange?: (year: string) => void;
    options: string[];
    selectedYear: string;
}): JSX.Element => (
    <Dropdown>
        <Dropdown.Trigger>
            {({ open }) => (
                <button
                    type="button"
                    className="transition-default flex items-center space-x-3 "
                >
                    <span className="font-medium dark:text-theme-hint-400">{selectedYear}</span>
                    <Icon
                        name="ChevronDownSmall"
                        className={cn(
                            "transform text-theme-secondary-700 transition duration-100 dark:text-theme-dark-200",
                            {
                                "rotate-180": open,
                            },
                        )}
                    />
                </button>
            )}
        </Dropdown.Trigger>

        <Dropdown.Content
            className="left-0 right-0 z-10 w-full origin-top-right px-6 sm:left-auto sm:mt-2 sm:h-fit sm:w-48 sm:px-0"
            contentClasses="shadow-3xl flex w-full select-none flex-col overflow-hidden rounded-xl bg-white py-3.5 dark:bg-theme-dark-900 dark:border dark:border-theme-dark-700"
        >
            {({ setOpen }) =>
                options.map((year) => (
                    <DropdownButton
                        key={year}
                        isActive={selectedYear === year}
                        onClick={() => {
                            setOpen(false);
                            onChange?.(year);
                        }}
                    >
                        {year}
                    </DropdownButton>
                ))
            }
        </Dropdown.Content>
    </Dropdown>
);

export const WinnerCollectionsFilter = (): JSX.Element => {
    const { t } = useTranslation();

    const options = ["2023", "2022", "2021"];
    const [selectedYear, setSelectedYear] = useState("2023");

    return (
        <div className="border-t border-theme-secondary-300 p-8 dark:border-theme-dark-700">
            <div className="flex items-center justify-between">
                <Heading level={4}>{t("pages.collections.collection_of_the_month.previous_winners")}</Heading>

                <YearSelectionDropdown
                    options={options}
                    selectedYear={selectedYear}
                    onChange={(year) => {
                        setSelectedYear(year);
                    }}
                />
            </div>
        </div>
    );
};