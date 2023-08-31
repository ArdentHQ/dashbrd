import cn from "classnames";
import { useTranslation } from "react-i18next";
import { LinkButton } from "@/Components/Link";
import { PortfolioBreakdownLine } from "@/Components/PortfolioBreakdown";
import { Skeleton } from "@/Components/Skeleton";

export const BalanceHeaderSkeleton = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div
                data-testid="BalanceHeaderSkeleton"
                className="hidden items-center justify-between whitespace-nowrap rounded-xl border border-theme-secondary-300 px-6 py-4 sm:block xl:flex"
            >
                <div className="flex w-auto justify-between pb-3 xl:justify-start xl:divide-x  xl:divide-theme-secondary-300 xl:pb-0">
                    <div className="flex divide-x divide-theme-secondary-300 font-medium">
                        <div className="pr-4">
                            <div className="text-sm text-theme-secondary-500">{t("common.my_balance")}</div>
                            <Skeleton
                                className="mt-1 h-6"
                                width={91}
                            />
                        </div>

                        <div className="px-4">
                            <div className="text-sm text-theme-secondary-500">{t("common.tokens")}</div>
                            <Skeleton
                                className="mt-1 h-6"
                                width={30}
                            />
                        </div>
                    </div>

                    <div className="pl-4 font-medium">
                        <div className="text-right text-sm text-theme-secondary-500 xl:text-left">
                            {t("common.my_address")}
                        </div>

                        <div className="flex items-center space-x-2 text-right text-lg text-theme-secondary-900 xl:text-left">
                            <Skeleton
                                className="mt-1 h-6"
                                width={178}
                            />

                            <Skeleton
                                className="mt-1 h-6"
                                width={24}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-1 space-y-4 border-t border-dotted border-theme-secondary-300 pt-4 xl:ml-20 xl:mt-0 xl:w-full xl:border-t-0 xl:pt-0 2xl:ml-28">
                    <div className="flex items-center justify-between xl:justify-end">
                        <div className="hidden sm:block md:hidden">
                            <div className="flex space-x-2">
                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />
                            </div>
                        </div>

                        <div className="hidden md:block lg:hidden xl:block 2xl:hidden">
                            <div className="flex space-x-2">
                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />

                                <Skeleton
                                    width={60}
                                    height={18}
                                />
                            </div>
                        </div>

                        <div className="hidden lg:block xl:hidden 2xl:block">
                            <div className="flex space-x-2">
                                <Skeleton
                                    width={60}
                                    height={20}
                                />

                                <Skeleton
                                    width={60}
                                    height={20}
                                />

                                <Skeleton
                                    width={60}
                                    height={20}
                                />

                                <Skeleton
                                    width={60}
                                    height={20}
                                />

                                <Skeleton
                                    width={60}
                                    height={20}
                                />
                            </div>
                        </div>

                        <div className="ml-4 flex pl-4 text-sm xl:border-l xl:border-theme-secondary-300">
                            <LinkButton
                                data-testid="BalanceHeader__more-details"
                                className={cn(
                                    "transition-default rounded-full text-sm font-medium leading-5.5 text-theme-hint-600 underline decoration-transparent underline-offset-2 outline-none",
                                    "hover:text-theme-hint-700 hover:decoration-theme-hint-700",
                                    "outline-offset-4 focus-visible:outline-3 focus-visible:outline-theme-hint-300",
                                )}
                            >
                                {t("common.more_details")}
                            </LinkButton>
                        </div>
                    </div>

                    <PortfolioBreakdownLine assets={[]} />
                </div>
            </div>
        </>
    );
};
