/* eslint-disable sonarjs/no-duplicate-string */

import { router } from "@inertiajs/core";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell, TableRow } from "@/Components/Table";
import { TimeAgo } from "@/Components/TimeAgo";
import { Tooltip } from "@/Components/Tooltip";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { useNetwork } from "@/Hooks/useNetwork";
import { FormatFiat, FormatFiatShort, FormatNumber } from "@/Utils/Currency";
import { toHuman } from "@/Utils/dates";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const AddressLink = ({
    address,
    chainId,
    length = 12,
}: {
    address: string;
    chainId: number;
    length?: number;
}): JSX.Element => {
    const { t } = useTranslation();

    const addressUrl = (address: string): string => {
        const { isPolygon } = useNetwork();

        if (isPolygon(chainId)) {
            return t("urls.explorers.polygonscan.addresses", { address });
        }

        return t("urls.explorers.etherscan.addresses", { address });
    };

    return (
        <div
            data-testid="CollectionActivityTable_address"
            className="flex items-center"
        >
            <Link
                variant="link"
                fontSize="text-sm sm:text-base"
                textColor="text-theme-primary-600"
                className="flex items-center"
                href={addressUrl(address)}
                external
                iconClassName="ml-2 text-theme-secondary-500"
            >
                <span className="whitespace-nowrap">
                    <TruncateMiddle
                        length={length}
                        text={formatAddress(address)}
                    />
                </span>
            </Link>
        </div>
    );
};

export const Name = ({
    activity,
    collection,
}: {
    activity: App.Data.Nfts.NftActivityData;
    collection: App.Data.Collections.CollectionBasicDetailsData;
}): JSX.Element => (
    <div
        data-testid="ActivityTable__name"
        className="flex cursor-pointer flex-row-reverse items-center gap-x-2 md:flex-row md:gap-x-3"
        onClick={() => {
            router.visit(
                route("collection-nfts.view", {
                    collection: collection.slug,
                    nft: activity.nft.tokenNumber,
                }),
            );
        }}
    >
        <div className="h-5 w-5 overflow-hidden rounded-full md:h-10 md:w-10">
            <Img
                data-testid="ActivityTable__image"
                className="block aspect-square h-full w-full grow bg-theme-secondary-100 object-cover"
                src={activity.nft.images.small ?? undefined}
            />
        </div>

        <span className="transition-default truncate text-base font-medium leading-5.5 text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 outline-offset-4 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300 md:max-w-[8.125rem] lg:max-w-[16.875rem] xl:max-w-[25rem]">
            {activity.nft.name}
        </span>
    </div>
);

export const NameMobile = ({
    activity,
    collection,
}: {
    activity: App.Data.Nfts.NftActivityData;
    collection: App.Data.Collections.CollectionBasicDetailsData;
}): JSX.Element => (
    <span
        data-testid="ActivityTable__name_mobile"
        onClick={() => {
            router.visit(
                route("collection-nfts.view", {
                    collection: collection.slug,
                    nft: activity.nft.tokenNumber,
                }),
            );
        }}
        className="transition-default cursor-pointer truncate font-medium leading-5.5 text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 outline-offset-4 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300"
    >
        {activity.nft.name}
    </span>
);

const determineActivityPrices = (
    activity: App.Data.Nfts.NftActivityData,
): { totalUsd: string | null; totalNative: string | null } => {
    if (activity.type !== "LABEL_MINT") {
        return {
            totalUsd: activity.totalUsd,
            totalNative: activity.totalNative,
        };
    }

    return { totalUsd: null, totalNative: null };
};

export const Type = ({
    chainId,
    activity,
    collection,
    nativeToken,
    showNameColumn,
}: {
    chainId: number;
    activity: App.Data.Nfts.NftActivityData;
    collection: App.Data.Collections.CollectionBasicDetailsData;
    nativeToken?: App.Data.Token.TokenData;
    showNameColumn: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isSmAndAbove, isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();

    const transactionUrl = (id: string): string => {
        const { isPolygon } = useNetwork();

        if (isPolygon(chainId)) {
            return t("urls.explorers.polygonscan.transactions", { id });
        }

        return t("urls.explorers.etherscan.transactions", { id });
    };

    const icons: Record<App.Enums.NftTransferType, IconName> = {
        // @TODO: define the icon for mint
        LABEL_MINT: "LayeredCards",
        LABEL_TRANSFER: "ArrowUpArrowDown",
        LABEL_SALE: "Cart",
    };

    // This will need to be adjusted if more types are added
    const activityIcon = icons[activity.type];

    const activityTypeLabel = t(`pages.collections.activities.types.${activity.type}`);

    const { totalUsd, totalNative } = determineActivityPrices(activity);

    if (isSmAndAbove) {
        return (
            <>
                <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-theme-secondary-100">
                    {showNameColumn && !isLgAndAbove && (
                        <Img
                            data-testid="ActivityTable__image"
                            className="block aspect-square h-full w-full grow bg-theme-secondary-100 object-cover"
                            src={activity.nft.images.small ?? undefined}
                        />
                    )}

                    {(!showNameColumn || isLgAndAbove) && <Icon name={activityIcon} />}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center">
                        {showNameColumn && !isLgAndAbove && (
                            <NameMobile
                                activity={activity}
                                collection={collection}
                            />
                        )}
                        {showNameColumn && !isMdAndAbove && (
                            <>
                                {!isLgAndAbove && (
                                    <div className="mx-2 h-[5px] w-[5px] rounded-full bg-theme-secondary-300" />
                                )}
                                <Timestamp value={activity.timestamp} />
                            </>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex",
                            showNameColumn && !isLgAndAbove
                                ? "flex-row items-center"
                                : "flex-col space-y-1 md-lg:space-y-0",
                        )}
                    >
                        <div className="flex items-center">
                            <Link
                                variant="link"
                                className="flex items-center leading-6"
                                fontSize="text-base"
                                textColor="text-theme-primary-600"
                                href={transactionUrl(activity.id)}
                                external
                                iconClassName="ml-2 text-theme-secondary-500"
                            >
                                {activityTypeLabel}
                            </Link>
                            {!showNameColumn && !isMdAndAbove && (
                                <>
                                    <div className="mx-2 h-[5px] w-[5px] rounded-full bg-theme-secondary-300" />
                                    <Timestamp value={activity.timestamp} />
                                </>
                            )}
                        </div>

                        {!isXlAndAbove && (
                            <>
                                {showNameColumn && !isLgAndAbove && (
                                    <div className="mx-2 h-[5px] w-[5px] rounded-full bg-theme-secondary-300" />
                                )}
                                {isMdAndAbove && <Timestamp value={activity.timestamp} />}
                                {!isMdAndAbove && nativeToken != null && (
                                    <SalePrice
                                        usdPrice={totalUsd}
                                        nativePrice={totalNative}
                                        nativeToken={nativeToken}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
                {!isMdAndAbove && (
                    <div className="ml-auto flex flex-col items-end">
                        <div className="flex items-center space-x-2">
                            <Label>{t("common.from")}</Label>
                            <AddressLink
                                chainId={collection.chainId}
                                address={activity.sender}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Label>{t("common.to")}</Label>
                            <AddressLink
                                chainId={collection.chainId}
                                address={activity.recipient}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <Link
                variant="link"
                textColor="text-theme-primary-600"
                href={transactionUrl(activity.id)}
                className="flex items-center"
                external
                iconClassName="ml-2 text-theme-secondary-500"
            >
                <span className="text-sm font-medium">{activityTypeLabel}</span>
            </Link>

            <Icon
                name={activityIcon}
                className="text-theme-primary-600"
                size="lg"
            />
        </div>
    );
};

export const Timestamp = ({ value }: { value: number }): JSX.Element => {
    const { user } = useActiveUser();

    const attributes =
        user != null
            ? user.attributes
            : {
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  time_format: "24" as const,
                  date_format: "short",
              };

    return (
        <Tooltip content={toHuman(value * 1000, attributes)}>
            <span
                data-testid="ActivityTable__timestamp"
                className="whitespace-nowrap text-sm font-medium leading-5.5 text-theme-secondary-700 sm:text-base"
            >
                <TimeAgo date={new Date(value * 1000).toISOString()} />
            </span>
        </Tooltip>
    );
};

const Label = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <span className="text-sm font-medium leading-5.5 text-theme-secondary-700">{children}</span>
);

export const SalePrice = ({
    usdPrice,
    nativePrice,
}: {
    usdPrice: string | null;
    nativePrice: string | null;
    nativeToken: App.Data.Token.TokenData;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isSmAndAbove } = useBreakpoint();

    return (
        <>
            <div
                data-testid="CollectionActivityTable_salePrice"
                className="flex text-sm font-medium sm:text-base md:flex-col md:items-end xl:flex-row xl:items-start"
            >
                {isTruthy(nativePrice) && isTruthy(usdPrice) ? (
                    <>
                        <span className="whitespace-nowrap leading-5.5 text-theme-secondary-900">
                            <FormatNumber value={nativePrice} />
                            <span className="ml-1">ETH</span>
                        </span>
                        <span className="ml-1 leading-5.5 text-theme-secondary-700">
                            <span className="md:hidden xl:inline">(</span>
                            {isSmAndAbove ? <FormatFiat value={usdPrice} /> : <FormatFiatShort value={usdPrice} />}
                            <span className="md:hidden xl:inline">)</span>
                        </span>
                    </>
                ) : (
                    <p className="text-sm font-medium leading-5.5 text-theme-secondary-500 sm:text-base xl:w-24">
                        {t("common.na")}
                    </p>
                )}
            </div>
        </>
    );
};

interface CollectionActivityTableItemProperties {
    activity: App.Data.Nfts.NftActivityData;
    collection: App.Data.Collections.CollectionBasicDetailsData;
    isCompact: boolean;
    showNameColumn: boolean;
    nativeToken: App.Data.Token.TokenData;
    hasBorderBottom?: boolean;
}

export const CollectionActivityTableItemSkeleton = ({
    isCompact,
    showNameColumn,
}: {
    isCompact: boolean;
    showNameColumn: boolean;
}): JSX.Element => {
    const { isMdAndAbove, isXlAndAbove, isLgAndAbove } = useBreakpoint();

    if (isCompact) {
        return (
            <div className="flex flex-col space-y-3 border-b border-dashed border-theme-secondary-300 pb-4 last:border-none last:pb-0 md:pb-3">
                {showNameColumn && (
                    <div className="flex items-center justify-between">
                        <Skeleton
                            className="my-1"
                            height={14}
                            width={30}
                        />

                        <div className="flex items-center gap-x-2">
                            <Skeleton
                                className="my-1"
                                height={14}
                                width={140}
                            />
                            <Skeleton
                                width={20}
                                height={20}
                                isCircle
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={35}
                    />
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={120}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={50}
                    />
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={150}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={30}
                    />
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={145}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={40}
                    />
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={120}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={35}
                    />
                    <Skeleton
                        className="my-1"
                        height={14}
                        width={100}
                    />
                </div>
            </div>
        );
    }

    return (
        <TableRow>
            {showNameColumn && isLgAndAbove && (
                <TableCell variant="start">
                    <div className="flex items-center gap-x-3">
                        <Skeleton
                            width={40}
                            height={40}
                            isCircle
                        />
                        <Skeleton
                            height={16}
                            width={140}
                        />
                    </div>
                </TableCell>
            )}

            <TableCell variant={showNameColumn && isLgAndAbove ? "middle" : "start"}>
                {(isLgAndAbove || !showNameColumn) && (
                    <div className="flex items-center gap-x-3">
                        <Skeleton
                            width={40}
                            height={40}
                            isCircle
                        />

                        <div className="flex flex-col gap-y-1">
                            <Skeleton
                                className="my-1"
                                height={16}
                                width={100}
                            />
                            {!isXlAndAbove && (
                                <Skeleton
                                    className="my-1"
                                    height={16}
                                    width={120}
                                />
                            )}
                        </div>
                    </div>
                )}

                {!isLgAndAbove && showNameColumn && (
                    <div className="flex items-center gap-x-3">
                        <Skeleton
                            width={40}
                            height={40}
                            isCircle
                        />
                        <div className="flex flex-col gap-y-1">
                            <div>
                                <div className="flex items-center">
                                    <Skeleton
                                        className="my-1"
                                        height={16}
                                        width={140}
                                    />
                                    {!isMdAndAbove && (
                                        <div className="flex items-center">
                                            <div className="mx-2 h-[5px] w-[5px] rounded-full bg-theme-secondary-300" />
                                            <Skeleton
                                                className="my-1"
                                                height={16}
                                                width={90}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Skeleton
                                    className="my-1"
                                    height={16}
                                    width={80}
                                />
                                <div className="mx-2 h-[5px] w-[5px] rounded-full bg-theme-secondary-300" />
                                <Skeleton
                                    className="my-1"
                                    height={16}
                                    width={90}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </TableCell>

            <TableCell
                variant={isMdAndAbove ? "middle" : "end"}
                innerClassName={cn("font-medium text-theme-secondary-700", {
                    "flex-col justify-center !items-end": !isMdAndAbove,
                })}
            >
                <div className="flex flex-col items-end gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <div
                            className={cn("flex flex-col gap-y-1", {
                                "!items-end": !isMdAndAbove,
                            })}
                        >
                            <Skeleton
                                className="my-1"
                                height={16}
                                width={120}
                            />
                            {!isXlAndAbove && (
                                <Skeleton
                                    className="my-1"
                                    height={16}
                                    width={100}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>

            {isXlAndAbove && (
                <TableCell variant="middle">
                    <Skeleton
                        height={16}
                        width={140}
                    />
                </TableCell>
            )}

            {isXlAndAbove && (
                <TableCell variant="middle">
                    <Skeleton
                        height={16}
                        width={140}
                    />
                </TableCell>
            )}

            {isMdAndAbove && (
                <TableCell
                    variant="end"
                    innerClassName={cn("justify-end", {
                        "flex-col justify-center !items-end gap-y-1": !isXlAndAbove,
                    })}
                >
                    <Skeleton
                        className="my-1"
                        height={16}
                        width={100}
                    />
                    {!isXlAndAbove && (
                        <Skeleton
                            className="my-1"
                            height={16}
                            width={110}
                        />
                    )}
                </TableCell>
            )}
        </TableRow>
    );
};

export const CollectionActivityTableItem = ({
    activity,
    collection,
    isCompact,
    showNameColumn,
    nativeToken,
    hasBorderBottom = false,
}: CollectionActivityTableItemProperties): JSX.Element => {
    const { t } = useTranslation();

    const { isMdAndAbove, isMd, isSm, isLgAndAbove, isXlAndAbove } = useBreakpoint();

    const { totalUsd, totalNative } = determineActivityPrices(activity);

    if (isCompact) {
        return (
            <div className="flex flex-col space-y-3 border-b border-dashed border-theme-secondary-300 pb-4 last:border-none last:pb-0 md:pb-3">
                {showNameColumn && (
                    <div className="flex items-center justify-between">
                        <Label>{t("common.name")}</Label>
                        <Name
                            activity={activity}
                            collection={collection}
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Label>{t("common.type")}</Label>

                    <Type
                        chainId={collection.chainId}
                        activity={activity}
                        collection={collection}
                        showNameColumn={showNameColumn}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>{t("common.from")}</Label>
                    <AddressLink
                        chainId={collection.chainId}
                        address={activity.sender}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>{t("common.to")}</Label>
                    <AddressLink
                        chainId={collection.chainId}
                        address={activity.recipient}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>{t("common.sale_price")}</Label>
                    <SalePrice
                        usdPrice={totalUsd}
                        nativePrice={totalNative}
                        nativeToken={nativeToken}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label>{t("common.time")}</Label>
                    <Timestamp value={activity.timestamp} />
                </div>
            </div>
        );
    }

    return (
        <TableRow
            data-testid="ActivityTable__Row"
            borderClass={cn(
                "group border-b border-theme-secondary-300 border-dashed",
                hasBorderBottom ? "last:border-b-[5px] last:border-solid" : "last:border-b-0",
            )}
        >
            {showNameColumn && isLgAndAbove && (
                <TableCell variant="start">
                    <Name
                        activity={activity}
                        collection={collection}
                    />
                </TableCell>
            )}

            <TableCell variant={showNameColumn && isMdAndAbove ? "middle" : "start"}>
                <Type
                    chainId={collection.chainId}
                    activity={activity}
                    collection={collection}
                    nativeToken={nativeToken}
                    showNameColumn={showNameColumn}
                />
            </TableCell>
            {isMdAndAbove && (
                <TableCell
                    variant="middle"
                    innerClassName={cn("font-medium text-theme-secondary-700", {
                        "flex-col justify-center !items-start": !isSm && !isXlAndAbove,
                        "flex-col justify-center !items-end": isSm,
                    })}
                >
                    <div className="flex items-center space-x-2">
                        {!isXlAndAbove && <span>{t("common.from")}</span>}
                        <AddressLink
                            address={activity.sender}
                            chainId={collection.chainId}
                            length={isMd ? 9 : 12}
                        />
                    </div>

                    {!isXlAndAbove && (
                        <div className="mt-1 flex items-center space-x-2">
                            <span>{t("common.to")}</span>
                            <AddressLink
                                address={activity.recipient}
                                chainId={collection.chainId}
                            />
                        </div>
                    )}
                </TableCell>
            )}
            {isXlAndAbove && (
                <TableCell>
                    <AddressLink
                        address={activity.recipient}
                        chainId={collection.chainId}
                        length={12}
                    />
                </TableCell>
            )}
            {isMdAndAbove && (
                <TableCell
                    innerClassName={cn({
                        "flex-col justify-center !items-end": !isXlAndAbove,
                    })}
                >
                    <SalePrice
                        usdPrice={totalUsd}
                        nativePrice={totalNative}
                        nativeToken={nativeToken}
                    />
                </TableCell>
            )}
            {isXlAndAbove && (
                <TableCell
                    variant="end"
                    innerClassName="justify-end"
                >
                    <Timestamp value={activity.timestamp} />
                </TableCell>
            )}
        </TableRow>
    );
};
