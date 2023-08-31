import cn from "classnames";
import { useTranslation } from "react-i18next";
import { type BalanceHeaderProperties } from "./BalanceHeader.contracts";
import { BalanceHeaderSkeleton } from "./BalanceHeader.skeleton";
import { BalanceHeaderMobile } from "./BalanceHeaderMobile";
import { ClipboardButton } from "@/Components/Clipboard";
import { DynamicBalance } from "@/Components/DynamicBalance";
import { LinkButton } from "@/Components/Link";
import { PortfolioBreakdownLine, PortfolioBreakdownText } from "@/Components/PortfolioBreakdown";
import { useSliderContext } from "@/Components/Slider";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const BalanceHeader = ({
    balance,
    tokens,
    address,
    assets,
    currency,
    isLoading = false,
    onSend,
    onReceive,
}: BalanceHeaderProperties): JSX.Element => {
    const { t } = useTranslation();
    const { setOpen: setBreakdownOpen } = useSliderContext();
    const { isSmAndAbove } = useBreakpoint();

    if (!isSmAndAbove) {
        return (
            <BalanceHeaderMobile
                isLoading={isLoading}
                balance={balance}
                address={address}
                assets={assets}
                currency={currency}
                onSend={onSend}
                onReceive={onReceive}
            />
        );
    }

    if (isLoading) {
        return <BalanceHeaderSkeleton />;
    }

    return (
        <>
            <div
                data-testid="BalanceHeader"
                className="hidden items-center justify-between whitespace-nowrap rounded-xl border border-theme-secondary-300 px-6 py-4 sm:block xl:flex"
            >
                <div className="flex w-auto justify-between xl:justify-start xl:divide-x xl:divide-theme-secondary-300">
                    <div className="flex divide-x divide-theme-secondary-300 font-medium">
                        <div className="pr-4">
                            <div className="text-sm text-theme-secondary-500">{t("common.my_balance")}</div>
                            <div className="text-lg text-theme-secondary-900">
                                <DynamicBalance
                                    balance={balance}
                                    currency={currency}
                                />
                            </div>
                        </div>

                        <div className="px-4">
                            <div className="text-sm text-theme-secondary-500">{t("common.tokens")}</div>
                            <div className="text-lg text-theme-secondary-900">{tokens}</div>
                        </div>
                    </div>

                    <div className="pl-4 font-medium">
                        <div className="text-right text-sm text-theme-secondary-500 xl:text-left">
                            {t("common.my_address")}
                        </div>

                        <div className="flex items-center text-right text-lg text-theme-secondary-900 xl:text-left">
                            <TruncateMiddle
                                length={16}
                                text={address}
                            />

                            <ClipboardButton
                                text={address}
                                className="ml-3"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-4 border-t border-dotted border-theme-secondary-300 pt-4 xl:ml-20 xl:mt-0 xl:w-full xl:border-t-0 xl:pt-0 2xl:ml-28">
                    <div className="flex items-center justify-between xl:justify-end">
                        <div className="hidden sm:block md:hidden"></div>

                        <div className="hidden md:block lg:hidden xl:block 2xl:hidden">
                            <PortfolioBreakdownText
                                assets={assets}
                                showCount={4}
                            />
                        </div>

                        <div className="hidden lg:block xl:hidden 2xl:block">
                            <PortfolioBreakdownText
                                assets={assets}
                                showCount={5}
                            />
                        </div>

                        <div className="ml-4 flex pl-4 text-sm xl:border-l xl:border-theme-secondary-300">
                            <LinkButton
                                data-testid="BalanceHeader__more-details"
                                onClick={() => {
                                    setBreakdownOpen(true);
                                }}
                                className={cn(
                                    "transition-default rounded-full text-sm font-medium leading-5.5 text-theme-hint-600",
                                    "underline decoration-transparent underline-offset-2",
                                    "outline-none outline-3 outline-offset-4",
                                    "hover:text-theme-hint-700 hover:decoration-theme-hint-700",
                                    "focus-visible:outline-theme-hint-300",
                                )}
                            >
                                {t("common.more_details")}
                            </LinkButton>
                        </div>
                    </div>

                    <PortfolioBreakdownLine
                        assets={assets}
                        breakpoints={{
                            sm: 3,
                            md: 4,
                            lg: 5,
                            xl: 4,
                            "2xl": 5,
                        }}
                    />
                </div>
            </div>
        </>
    );
};
