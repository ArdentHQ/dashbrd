import cn from "classnames";
import { useTranslation } from "react-i18next";
import { LinkButton } from "@/Components/Link";
import { PortfolioBreakdownLine } from "@/Components/PortfolioBreakdown";
import { Skeleton } from "@/Components/Skeleton";

export const BalanceHeaderMobileSkeleton = ({ animated }: { animated: boolean }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div data-testid="BalanceHeaderMobileSkeleton">
            <div className="-mx-6 -mt-6 mb-6 flex bg-theme-secondary-50 px-6 py-2.5">
                <div className="flex w-full items-center justify-between">
                    <div className="flex text-sm font-medium">
                        <span className="mr-1 text-theme-secondary-700">{t("common.my_address")}:</span>
                        <Skeleton
                            height={15}
                            width={100}
                            animated={animated}
                        />
                    </div>

                    <Skeleton
                        height={20}
                        width={20}
                        animated={animated}
                    />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
                <div>
                    <div className="text-sm font-medium text-theme-secondary-500">{t("common.my_balance")}</div>
                    <div className="text-2xl font-medium text-theme-secondary-900">
                        <Skeleton
                            height={32}
                            width={120}
                            animated={animated}
                        />
                    </div>
                </div>

                <div className="flex flex-shrink-0 items-center justify-end space-x-3">
                    <Skeleton
                        width={40}
                        height={40}
                        isCircle
                        animated={animated}
                    />

                    <Skeleton
                        width={40}
                        height={40}
                        isCircle
                        animated={animated}
                    />

                    <Skeleton
                        width={40}
                        height={40}
                        isCircle
                        animated={animated}
                    />
                </div>
            </div>

            <div className="mt-4">
                <PortfolioBreakdownLine assets={[]} />

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <p className="text-sm font-medium leading-5.5 text-theme-secondary-700">
                            {t("common.tokens")}:
                        </p>

                        <Skeleton
                            height={12}
                            width={20}
                            animated={animated}
                        />
                    </div>

                    <LinkButton
                        data-testid="BalanceHeaderMobile__more-details"
                        className={cn(
                            "transition-default rounded-sm border-b border-transparent text-sm font-medium leading-none text-theme-hint-600 outline-none ",
                            "hover:border-theme-hint-700 hover:text-theme-hint-700",
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-hint-300 focus-visible:ring-offset-2",
                        )}
                    >
                        {t("common.more_details")}
                    </LinkButton>
                </div>
            </div>
        </div>
    );
};
