import cn from "classnames";
import { useTranslation } from "react-i18next";
import { BalanceHeaderMobileSkeleton } from "./BalanceHeaderMobile.skeleton";
import { type BalanceHeaderProperties } from "@/Components/BalanceHeader/BalanceHeader.contracts";
import { Clipboard } from "@/Components/Clipboard";
import { Icon } from "@/Components/Icon";
import { LinkButton } from "@/Components/Link";
import { PortfolioBreakdownLine } from "@/Components/PortfolioBreakdown";
import { useSliderContext } from "@/Components/Slider";
import { TokenActions } from "@/Components/Tokens/TokenActions";
import { FormatFiat } from "@/Utils/Currency";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const BalanceHeaderMobile = ({
    balance,
    address,
    assets,
    currency,
    isLoading = false,
    skeletonAnimated = true,
    onSend,
    onReceive,
}: BalanceHeaderProperties): JSX.Element => {
    const { t } = useTranslation();
    const { setOpen: setBreakdownOpen } = useSliderContext();

    if (isLoading) {
        return <BalanceHeaderMobileSkeleton animated={skeletonAnimated} />;
    }

    return (
        <div data-testid="BalanceHeaderMobile">
            <div className="-mx-6 -mt-6 mb-6 flex bg-theme-secondary-50 px-6 py-2.5 dark:bg-theme-dark-950">
                <div className="flex w-full items-center justify-between">
                    <div className="text-sm font-medium">
                        <span className="mr-1 text-theme-secondary-700 dark:text-theme-dark-200">
                            {t("common.my_address")}:
                        </span>
                        <span className="dark:text-theme-dark-50">
                            <TruncateMiddle
                                length={10}
                                text={address}
                            />
                        </span>
                    </div>

                    <Clipboard text={address}>
                        <button type="button">
                            <Icon
                                className="text-theme-primary-600 dark:text-theme-primary-400"
                                name="Copy"
                                size="md"
                            />
                        </button>
                    </Clipboard>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="space-y-0.5 text-center font-medium">
                    <p className="text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("common.my_balance")}
                    </p>
                    <p className="text-2xl text-theme-secondary-900 dark:text-theme-dark-50">
                        <FormatFiat
                            value={balance}
                            currency={currency}
                        />
                    </p>
                </div>

                <TokenActions
                    onSend={onSend}
                    onReceive={onReceive}
                    balance={balance}
                />
            </div>

            <div className="mt-4">
                <PortfolioBreakdownLine assets={assets} />

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200">
                        {t("common.tokens")}:{" "}
                        <span className="text-theme-secondary-900 dark:text-theme-dark-50">{assets.length}</span>
                    </p>

                    <LinkButton
                        data-testid="BalanceHeaderMobile__more-details"
                        onClick={() => {
                            setBreakdownOpen(true);
                        }}
                        className={cn(
                            "transition-default rounded-sm border-b border-transparent text-sm font-medium leading-none text-theme-primary-600 outline-none ",
                            "hover:border-theme-primary-700 hover:text-theme-primary-700",
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-primary-300 focus-visible:ring-offset-2",
                            "dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500",
                        )}
                    >
                        {t("common.more_details")}
                    </LinkButton>
                </div>
            </div>
        </div>
    );
};
