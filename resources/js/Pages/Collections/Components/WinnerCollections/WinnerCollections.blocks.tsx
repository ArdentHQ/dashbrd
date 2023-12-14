import { router } from "@inertiajs/core";
import cn from "classnames";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "@/Components/Dropdown";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { DropdownButton } from "@/Components/SortDropdown";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { WinnerBadgeFirst, WinnerBadgeSecond, WinnerBadgeThird } from "@/images";
import { FormatCrypto } from "@/Utils/Currency";
import { formatNumbershort } from "@/Utils/format-number";
import { isTruthy } from "@/Utils/is-truthy";

const WinnerCollectionLabel = ({ label, children }: { label: string; children: ReactNode }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <p className="flex w-full justify-between space-x-1 whitespace-nowrap text-sm font-medium sm:w-auto">
            <span className="text-theme-secondary-700 dark:text-theme-dark-200 ">{label}</span>

            {isTruthy(children) && <span className="text-theme-secondary-900 dark:text-theme-dark-50">{children}</span>}

            {!isTruthy(children) && (
                <span className="text-theme-secondary-900 dark:text-theme-dark-50">{t("common.na")}</span>
            )}
        </p>
    );
};

export const WinnerCollectionMainInfo = ({
    position,
    collection,
}: {
    position: number;
    collection: App.Data.Collections.CollectionOfTheMonthData;
}): JSX.Element => {
    const { t } = useTranslation();

    const token = {
        symbol: collection.floorPriceCurrency ?? "ETH",
        name: collection.floorPriceCurrency ?? "ETH",
        decimals: collection.floorPriceDecimals ?? 18,
    };

    return (
        <div className="w-full">
            <div className="flex w-full items-center space-x-3">
                <div className="flex items-center justify-start -space-x-2">
                    <Img
                        wrapperClassName="h-12 w-12"
                        className="rounded-full"
                        src={collection.image}
                    />

                    {position === 0 && (
                        <WinnerBadgeFirst className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {position === 1 && (
                        <WinnerBadgeSecond className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}

                    {position === 2 && (
                        <WinnerBadgeThird className="z-10 w-12 rounded-full bg-white ring-4 ring-white dark:bg-theme-dark-900 dark:ring-theme-dark-900" />
                    )}
                </div>

                <p
                    className={cn(
                        "line-clamp-2 w-full text-sm font-medium text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400",
                    )}
                >
                    {collection.name}
                </p>
            </div>

            <div className="mt-4 flex w-full flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 lg:hidden">
                <WinnerCollectionLabel label={t("common.volume")}>
                    <FormatCrypto
                        value={collection.volume ?? "0"}
                        token={token}
                    />
                </WinnerCollectionLabel>

                <WinnerCollectionLabel label={t("common.floor_price")}>
                    <FormatCrypto
                        value={collection.floorPrice ?? "0"}
                        token={token}
                    />
                </WinnerCollectionLabel>

                <WinnerCollectionLabel label={t("common.votes")}>
                    {formatNumbershort(collection.votes)}
                </WinnerCollectionLabel>
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

const YearSelectionDropdown = ({
    onChange,
    options,
    selectedYear,
}: {
    onChange?: (year: number) => void;
    options: number[];
    selectedYear: number;
}): JSX.Element => (
    <Dropdown>
        <Dropdown.Trigger>
            {({ open }) => (
                <button
                    type="button"
                    className="transition-default flex items-center space-x-3 "
                >
                    <span className="font-medium hover:text-theme-hint-700 dark:text-theme-hint-400">
                        {selectedYear}
                    </span>
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

export const WinnerCollectionsFilter = ({
    availableYears = [],
    selectedYear,
    onChange,
}: {
    availableYears: number[];
    selectedYear: number;
    onChange?: (year: number) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="border-t border-theme-secondary-300 p-8 dark:border-theme-dark-700">
            <div className="flex items-center justify-between">
                <Heading level={4}>{t("pages.collections.collection_of_the_month.previous_winners")}</Heading>

                <YearSelectionDropdown
                    options={availableYears}
                    selectedYear={selectedYear}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export const WinnerCollectionTableRow = ({
    index,
    collection,
    onClick,
}: {
    index: number;
    collection: App.Data.Collections.CollectionOfTheMonthData;
    onClick: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const token = {
        symbol: collection.floorPriceCurrency ?? "ETH",
        name: collection.floorPriceCurrency ?? "ETH",
        decimals: collection.floorPriceDecimals ?? 18,
    };

    return (
        <TableRow
            className="group cursor-pointer"
            onClick={onClick}
        >
            <TableCell
                innerClassName="p-4"
                className="w-full"
            >
                <WinnerCollectionMainInfo
                    position={index}
                    collection={collection}
                />
            </TableCell>

            <TableCell
                className="hidden lg:table-cell"
                paddingClassName="p-4"
                innerClassName="justify-end"
            >
                <WinnerCollectionLabel label={t("common.volume")}>
                    <FormatCrypto
                        value={collection.volume ?? "0"}
                        token={token}
                    />
                </WinnerCollectionLabel>
            </TableCell>

            <TableCell
                className="hidden lg:table-cell"
                paddingClassName="p-4"
                innerClassName="justify-end"
            >
                <WinnerCollectionLabel label={t("common.floor_price")}>
                    <FormatCrypto
                        value={collection.floorPrice ?? "0"}
                        token={token}
                    />
                </WinnerCollectionLabel>
            </TableCell>

            <TableCell
                className="hidden lg:table-cell"
                paddingClassName="p-4"
                innerClassName="justify-end"
            >
                <WinnerCollectionLabel label={t("common.votes")}>
                    {formatNumbershort(collection.votes)}
                </WinnerCollectionLabel>
            </TableCell>
        </TableRow>
    );
};

export const WinnerCollectionsTable = ({
    month,
    collections,
}: {
    month: number;
    collections: App.Data.Collections.CollectionWinnersData;
}): JSX.Element => {
    const { t } = useTranslation();

    const columns = [
        {
            id: "info",
            cellWidth: "w-full",
        },
        {
            id: "volume",
            className: "justify-end",
        },
        {
            id: "floorPrice",
        },
        {
            id: "votes",
            sortDescFirst: true,
        },
    ];

    return (
        <div className="border-t border-theme-secondary-300 dark:border-theme-dark-700">
            <div className="p-8">
                <Heading
                    level={4}
                    className="mb-4"
                >
                    {t("pages.collections.collection_of_the_month.winners_month", {
                        month: [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                        ][month - 1],
                    })}
                </Heading>

                <Table
                    hideHeader
                    columns={columns}
                    data={collections.winners.slice(0, 3)}
                    row={(collection, index) => (
                        <WinnerCollectionTableRow
                            onClick={() => {
                                router.visit(
                                    route("collections.view", {
                                        slug: collection.slug,
                                    }),
                                );
                            }}
                            collection={collection}
                            index={index}
                            key={index}
                        />
                    )}
                />
            </div>
        </div>
    );
};
