import { pick } from "@ardenthq/sdk-helpers";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column } from "react-table";

import { CollectionActivityTableItem, CollectionActivityTableItemSkeleton } from "./CollectionActivityTable.blocks";
import { Pagination } from "@/Components/Pagination";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";
import { Table } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

interface Properties {
    activities: App.Data.Nfts.NftActivitiesData | null;
    collection: App.Data.Collections.CollectionBasicDetailsData;
    isLoading?: boolean;
    showNameColumn?: boolean;
    onPageLimitChange: (pageLimit: number) => void;
    pageLimit: number;
    nativeToken: App.Data.Token.TokenData;
}

export const CollectionActivityTable = ({
    activities,
    collection,
    isLoading = false,
    showNameColumn = false,
    onPageLimitChange,
    pageLimit,
    nativeToken,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    const { isLgAndAbove, isMdAndAbove, isXlAndAbove, isSmAndAbove, isXsAndAbove, isMdLg } = useBreakpoint();

    const columns = useMemo<Array<Column<App.Data.Nfts.NftActivityData>>>(() => {
        const columnConfigs: Record<string, Column<App.Data.Nfts.NftActivityData>> = {
            name: {
                Header: t("common.name").toString(),
                accessor: (activity) => (isLoading ? undefined : activity.nft.name),
                noWrap: true,
                disableSortBy: true,
                className: "md:max-w-[11.25rem] lg:max-w-[20rem] xl:max-w-[28.125rem]",
            },
            from: {
                Header: isXlAndAbove ? t("common.from").toString() : `${t("common.from")} - ${t("common.to")}`,
                accessor: "sender",
                disableSortBy: true,
                className: "justify-start",
            },
            to: {
                Header: t("common.to").toString(),
                accessor: "recipient",
                disableSortBy: true,
            },
            salePrice: {
                Header: t("common.sale_price").toString(),
                accessor: "nft",
                className: !isXlAndAbove ? "justify-end" : "justify-start",
                disableSortBy: true,
            },
            type: {
                Header: t("common.type").toString(),
                accessor: "type",
                disableSortBy: true,
            },
            timestamp: {
                Header: t("common.time").toString(),
                accessor: "timestamp",
                className: "justify-end",
                cellWidth: "w-full",
                disableSortBy: true,
            },
            recentActivity: {
                Header: t("common.recent_activity").toString(),
                accessor: "timestamp",
                disableSortBy: true,
                className: "salam",
            },
        };

        let columns: Array<Column<App.Data.Nfts.NftActivityData>> = [columnConfigs.recentActivity];

        // Please be careful with the order of the objects as the loop
        // has to start from the largest screen size and go down.
        const visibleColumns = [
            {
                matches: isXlAndAbove,
                columns: ["name", "type", "from", "to", "salePrice", "timestamp"],
            },
            {
                matches: isLgAndAbove,
                columns: ["name", "type", "from", "salePrice"],
            },
            {
                matches: isMdAndAbove,
                columns: showNameColumn ? ["name", "from", "salePrice"] : ["type", "from", "salePrice"],
            },
            {
                matches: isMdLg,
                columns: ["name", "from", "salePrice"],
            },
        ];

        for (const config of visibleColumns) {
            if (config.matches) {
                const cols = showNameColumn ? config.columns : config.columns.filter((colName) => colName !== "name");
                columns = Object.values(pick(columnConfigs, cols));
                break;
            }
        }

        return columns;
    }, [t, isLgAndAbove, isMdAndAbove, isXlAndAbove, isMdLg, showNameColumn, isLoading]);

    const renderTableRow = useCallback(
        (activity: App.Data.Nfts.NftActivityData) => {
            if (isLoading) {
                return (
                    <CollectionActivityTableItemSkeleton
                        isCompact={!isSmAndAbove}
                        showNameColumn={showNameColumn}
                    />
                );
            }

            return (
                <CollectionActivityTableItem
                    activity={activity}
                    collection={collection}
                    isCompact={!isSmAndAbove}
                    showNameColumn={showNameColumn}
                    nativeToken={nativeToken}
                    hasBorderBottom={activities !== null && activities.paginated.meta.total <= 10}
                />
            );
        },
        [collection, isLoading, isXsAndAbove, isSmAndAbove, showNameColumn],
    );

    const tableData = useMemo(
        () =>
            isLoading
                ? (Array.from({ length: 5 }).fill({}) as App.Data.Nfts.NftActivityData[])
                : activities !== null
                ? activities.paginated.data
                : [],
        [isLoading, activities],
    );

    return (
        <>
            <Table
                data-testid="CollectionActivityTable"
                variant={isSmAndAbove ? "default" : "borderless"}
                columns={columns}
                data={tableData}
                row={renderTableRow}
                footer={
                    activities !== null &&
                    activities.paginated.meta.total > 10 && (
                        <div className="flex items-center justify-between space-x-3 rounded-b border-t border-theme-secondary-300 p-4">
                            <SelectPageLimit
                                value={pageLimit}
                                onChange={({ value }) => {
                                    onPageLimitChange(Number(value));
                                }}
                                suffix={t("common.records")}
                                className="xs:w-60"
                                optionClassName="w-40"
                            />
                            {activities.paginated.meta.last_page > 1 && <Pagination data={activities.paginated} />}
                        </div>
                    )
                }
                customWrapper={
                    isSmAndAbove
                        ? undefined
                        : (children: React.ReactNode) => (
                              <div
                                  data-testid="CollectionActivityTable__Mobile"
                                  className="flex flex-col"
                              >
                                  {children}

                                  {activities !== null && activities.paginated.meta.total > 10 && (
                                      <div className="mt-3 flex flex-col items-center justify-center">
                                          <SelectPageLimit
                                              value={pageLimit}
                                              onChange={({ value }) => {
                                                  onPageLimitChange(Number(value));
                                              }}
                                              suffix={t("common.records")}
                                              className="xs:w-60"
                                              optionClassName="w-40"
                                          />

                                          {activities.paginated.meta.last_page > 1 && (
                                              <Pagination
                                                  data={activities.paginated}
                                                  className="flex w-full flex-col justify-center xs:items-center  sm:px-8"
                                              />
                                          )}
                                      </div>
                                  )}
                              </div>
                          )
                }
            />
        </>
    );
};
