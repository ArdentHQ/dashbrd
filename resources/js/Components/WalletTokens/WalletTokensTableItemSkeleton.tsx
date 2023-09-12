import React from "react";

import { useTranslation } from "react-i18next";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const WalletTokensTableItemSkeleton = ({
    index,
    isCompact,
    disabled,
}: {
    index: number;
    isCompact: boolean;
    disabled: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();

    if (!isCompact) {
        return (
            <TableRow
                key={index}
                data-testid="WalletTokensTableItemSkeleton"
            >
                <TableCell
                    variant="start"
                    innerClassName="py-4"
                >
                    <div className="flex items-center space-x-3">
                        <Skeleton
                            isCircle
                            className="h-10 w-10"
                            disabled={disabled}
                        />

                        <div className="flex flex-col items-start space-y-0.5">
                            <Skeleton
                                className="my-1 h-4 w-10"
                                disabled={disabled}
                            />
                            <Skeleton
                                className="my-1 h-3.5 w-24"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </TableCell>

                <TableCell innerClassName="justify-end">
                    <div className="flex flex-col items-end space-y-0.5">
                        <Skeleton
                            className="my-1 h-4 w-24"
                            disabled={disabled}
                        />
                        <Skeleton
                            className="my-1 h-3.5 w-12"
                            disabled={disabled}
                        />
                    </div>
                </TableCell>

                <TableCell innerClassName="justify-end">
                    <div className="flex flex-col items-end space-y-0.5">
                        <Skeleton
                            className="my-1 h-4 w-16"
                            disabled={disabled}
                        />
                        <Skeleton
                            className="my-1 h-3.5 w-10"
                            disabled={disabled}
                        />
                    </div>
                </TableCell>

                {isLgAndAbove && (
                    <TableCell
                        className="hidden lg:table-cell"
                        innerClassName="justify-end"
                    >
                        <Skeleton
                            className="h-5 w-12"
                            disabled={disabled}
                        />
                    </TableCell>
                )}

                {isXlAndAbove && (
                    <TableCell
                        className="hidden xl:table-cell"
                        innerClassName="justify-end"
                    >
                        <Skeleton
                            className="h-5 w-16"
                            disabled={disabled}
                        />
                    </TableCell>
                )}

                {isLgAndAbove && (
                    <TableCell
                        className="hidden lg:table-cell"
                        innerClassName="justify-end"
                    >
                        <Skeleton
                            className="h-10 w-25"
                            disabled={disabled}
                        />
                    </TableCell>
                )}

                <TableCell
                    variant="end"
                    innerClassName="justify-end"
                >
                    {isMdAndAbove ? (
                        <div className="relative inline-flex items-center overflow-hidden rounded-3xl px-5 py-2 font-medium">
                            <div className="absolute inset-0">
                                <Skeleton
                                    className="h-10 w-full"
                                    disabled={disabled}
                                />
                            </div>

                            <span>{t("common.details")}</span>
                        </div>
                    ) : (
                        <Skeleton
                            isCircle
                            className="block h-10 w-10 md:hidden"
                            disabled={disabled}
                        />
                    )}
                </TableCell>
            </TableRow>
        );
    }

    return (
        <button
            data-testid="WalletTokensTableItemSkeletonMobile"
            type="button"
            className="flex items-center justify-between rounded-xl border border-theme-secondary-300 px-4 py-5 transition-all"
            disabled
        >
            <div className="flex items-center space-x-3">
                <Skeleton
                    isCircle
                    className="h-10 w-10"
                    disabled={disabled}
                />

                <div className="flex flex-col items-start space-y-0.5 font-medium">
                    <Skeleton
                        className="my-1 h-3.5 w-10"
                        disabled={disabled}
                    />
                    <Skeleton
                        className="my-[3px] h-3 w-16"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="flex flex-col items-end space-y-0.5 font-medium">
                <Skeleton
                    className="my-1 h-3.5 w-10"
                    disabled={disabled}
                />
                <Skeleton
                    className="my-[3px] h-3 w-24"
                    disabled={disabled}
                />
            </div>
        </button>
    );
};
