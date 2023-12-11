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
import { FormatCrypto, FormatFiatShort } from "@/Utils/Currency";
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
            <div className="flex w-full items-center space-x-3 overflow-hidden">
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
                        "w-full truncate text-sm font-medium text-theme-secondary-900 dark:text-theme-dark-50",
                    )}
                >
                    {collection.name}
                </p>
            </div>

            <div className="mt-4 flex w-full flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 md:hidden">
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
                    <FormatFiatShort
                        value={collection.votes.toString()}
                        currency=""
                    />
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

export const WinnerCollectionsFilter = ({
    availableYears = [],
    selectedYear,
    onChange,
}: {
    availableYears: string[];
    selectedYear: string;
    onChange?: (year: string) => void;
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
}: {
    index: number;
    collection: App.Data.Collections.CollectionOfTheMonthData;
}): JSX.Element => {
    const { t } = useTranslation();

    const token = {
        symbol: collection.floorPriceCurrency ?? "ETH",
        name: collection.floorPriceCurrency ?? "ETH",
        decimals: collection.floorPriceDecimals ?? 18,
    };

    return (
        <TableRow>
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
                className="hidden md:table-cell"
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
                className="hidden md:table-cell"
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
                className="hidden md:table-cell"
                paddingClassName="p-4"
                innerClassName="justify-end"
            >
                <WinnerCollectionLabel label={t("common.votes")}>
                    <FormatFiatShort
                        value={collection.votes.toString()}
                        currency=""
                    />
                </WinnerCollectionLabel>
            </TableCell>
        </TableRow>
    );
};

export const WinnerCollectionsTable = ({
    month,
    collections,
}: {
    month: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
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
            sortDescFirst: true,
        },
        {
            id: "floorPrice",
        },
        {
            id: "votes",
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
                        month,
                    })}
                </Heading>

                <Table
                    hideHeader
                    columns={columns}
                    data={collections.slice(0, 3)}
                    row={(collection, index) => (
                        <WinnerCollectionTableRow
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