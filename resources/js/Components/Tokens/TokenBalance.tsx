import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { TokenActions } from "@/Components/Tokens/TokenActions";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { formatCrypto, formatFiat } from "@/Utils/Currency";
import { FormatPercentage } from "@/Utils/Percentage";

interface Properties {
    asset: App.Data.TokenListItemData;
    currency: string;
    onSend?: () => void;
    onReceive?: () => void;
}

export const TokenBalance = ({ asset, currency, onSend, onReceive }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
    };
    const formattedBalance = formatCrypto({
        value: asset.balance.toString(),
        token,
        t,
    });

    const fiatBalance = formatFiat({
        value: asset.fiat_balance ?? "0",
        currency,
        t,
    });

    const cryptoBalanceReference = useRef<HTMLSpanElement>(null);
    const isCryptoBalanceTruncated = useIsTruncated({ reference: cryptoBalanceReference });

    const fiatBalanceReference = useRef<HTMLParagraphElement>(null);
    const isFiatBalanceTruncated = useIsTruncated({ reference: fiatBalanceReference });

    return (
        <div className="flex flex-col space-y-4 px-6 py-6 sm:px-8">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-end sm:space-y-0">
                <div className="w-full sm:w-2/3">
                    <div className="space-y-0.5 text-center font-medium sm:text-left">
                        <p className="text-sm leading-5.5 text-theme-secondary-500">{t("common.my_balance")}</p>
                        <Tooltip
                            content={fiatBalance}
                            disabled={!isFiatBalanceTruncated}
                        >
                            <p
                                className="truncate text-2xl text-theme-secondary-900"
                                ref={fiatBalanceReference}
                            >
                                {fiatBalance}
                            </p>
                        </Tooltip>
                    </div>
                </div>

                <div className="sm:w-1/3">
                    <TokenActions
                        balance={asset.balance}
                        onSend={onSend}
                        onReceive={onReceive}
                    />
                </div>
            </div>

            <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm font-medium">
                    <Tooltip
                        content={`${formattedBalance} ${asset.symbol}`}
                        disabled={!isCryptoBalanceTruncated}
                    >
                        <div className="flex min-w-0 pr-2 text-theme-secondary-900">
                            <span
                                className="mr-1 truncate"
                                ref={cryptoBalanceReference}
                            >
                                {formattedBalance}
                            </span>
                            <span>{asset.symbol}</span>
                        </div>
                    </Tooltip>

                    <Tooltip content={t("pages.token_panel.balance_tooltip")}>
                        <span className="text-theme-secondary-700">
                            <FormatPercentage
                                value={Number(asset.percentage)}
                                decimals={2}
                            />
                        </span>
                    </Tooltip>
                </div>

                <div className="h-2 bg-theme-primary-200">
                    <div
                        className="h-2 bg-theme-primary-600"
                        style={{
                            width: `${Math.round((Number(asset.percentage) + Number.EPSILON) * 100)}%`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
