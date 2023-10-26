import cn from "classnames";
import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useTranslation } from "react-i18next";
import { extractTokenPriceData, Label } from "./Steps/ExecutionStep.blocks";
import { calculateGasFee } from "./Steps/InitiationStep.blocks";
import { Icon } from "@/Components/Icon";
import { type TransactionIntent } from "@/Components/TransactionFormSlider/TransactionFormSlider.contracts";
import { useNetwork } from "@/Hooks/useNetwork";
import { Ethereum, Polygon } from "@/images";
import { convertToFiat } from "@/Utils/convert-currency";
import { FormatCrypto, FormatFiat } from "@/Utils/Currency";

export interface TransactionBreakdownProperties {
    transactionIntent: Required<Omit<TransactionIntent, "hash">>;
    userCurrency: string;
}

export const TransactionBreakdown = ({
    userCurrency,
    transactionIntent,
}: TransactionBreakdownProperties): JSX.Element => {
    const { t } = useTranslation();

    const { isPolygon, isEthereum, isTestnet } = useNetwork();

    const { asset, amount, nativeToken, fee, nativeTokenPrice: nativeTokenPriceData } = transactionIntent;

    const { decimals, symbol, token_price: tokenPrice } = asset;

    const token = {
        decimals,
        symbol,
        name: asset.name,
    };

    const { guid: nativeTokenGuid, price } = nativeTokenPriceData;

    const nativeTokenPrice = extractTokenPriceData({ [nativeTokenGuid]: price }, userCurrency, nativeTokenGuid);

    const amountNative = parseUnits(amount.toString(), decimals);
    const amountFiat = convertToFiat(amountNative.toString(), Number(tokenPrice), decimals);

    const gasFeeNative = calculateGasFee(asset, fee.maxFee, nativeToken);
    const gasFeeWei = ethers.utils.parseEther(gasFeeNative);

    const gasFeeFiat = nativeTokenPrice.price * +gasFeeNative;

    return (
        <div
            className="mt-3 overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700"
            data-testid="Transaction__Breakdown"
        >
            <div className="relative flex flex-col items-center border-b border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:flex-row">
                <div className="relative mb-6 sm:mb-0 sm:w-1/2">
                    <div
                        className="after:absolute after:-right-px after:-top-px after:h-3 after:text-theme-secondary-300 dark:after:text-theme-dark-700 sm:after:border sm:after:content-['']"
                        data-testid="Transaction__AmountFiat"
                    >
                        <Label>
                            {t("pages.send_receive_panel.send.amount")}{" "}
                            <FormatFiat
                                value={amountFiat.toString()}
                                currency={userCurrency}
                            />
                        </Label>
                    </div>
                    <p
                        className="mt-0.5 text-center font-medium text-theme-secondary-900 after:absolute after:-bottom-px after:-right-px after:h-3 after:text-theme-secondary-300 dark:text-theme-dark-50 dark:after:text-theme-dark-700 sm:text-left sm:after:border sm:after:content-['']"
                        data-testid="Transaction__AmountNative"
                    >
                        <FormatCrypto
                            value={amountNative.toString()}
                            token={token}
                        />
                    </p>
                </div>

                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-2/4 bg-theme-secondary-300 dark:bg-theme-dark-700 sm:hidden"></div>
                <div className="left-1/2 -mt-1 -translate-x-2/4 sm:absolute sm:mt-0">
                    <Icon
                        name="FatPlus"
                        className="h-4 w-4 text-theme-secondary-900 dark:text-theme-dark-50"
                    />
                </div>

                <div
                    className="mt-6 flex flex-col items-center sm:mt-0 sm:w-1/2 sm:items-end"
                    data-testid="Transaction__FiatGasFee"
                >
                    <Label>
                        {t("pages.send_receive_panel.send.fee")}{" "}
                        <FormatFiat
                            value={gasFeeFiat.toString()}
                            currency={userCurrency}
                            maxDecimals={3}
                        />
                    </Label>
                    <p
                        className="mt-0.5 font-medium text-theme-secondary-900 dark:text-theme-dark-50"
                        data-testid="Transaction__GasFee"
                    >
                        <FormatCrypto
                            value={gasFeeWei.toString()}
                            token={nativeToken}
                        />
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-center bg-theme-secondary-50 px-6 py-4 dark:bg-theme-dark-950">
                <div
                    className={cn("mb-2 h-8 w-8", {
                        "opacity-20 saturate-0": isTestnet(nativeToken.chainId),
                    })}
                >
                    {isPolygon(nativeToken.chainId) && <Polygon data-testid="Polygon" />}
                    {isEthereum(nativeToken.chainId) && <Ethereum data-testid="Ethereum" />}
                </div>
                <Label>
                    {t("pages.send_receive_panel.send.total_amount")}{" "}
                    <FormatFiat
                        value={(amountFiat + gasFeeFiat).toString()}
                        currency={userCurrency}
                    />
                </Label>
                <p className="mt-0.5 font-medium text-theme-secondary-900 dark:text-theme-dark-50">
                    {nativeToken.symbol === symbol ? (
                        <span data-testid="Transaction__TotalAmount">
                            <FormatCrypto
                                value={amountNative.add(gasFeeWei).toString()}
                                token={token}
                            />
                        </span>
                    ) : (
                        <span data-testid="Transaction__BaseAndGasAmount">
                            <FormatCrypto
                                value={amountNative.toString()}
                                token={token}
                            />
                            <span> + </span>
                            <FormatCrypto
                                value={gasFeeWei.toString()}
                                token={nativeToken}
                            />
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};
