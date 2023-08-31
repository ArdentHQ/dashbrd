import cn from "classnames";
import { ethers } from "ethers";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TokenData = App.Data.Token.TokenData;
import { InputGroup } from "@/Components/Form/InputGroup";
import { Listbox } from "@/Components/Form/Listbox";
import { Skeleton } from "@/Components/Skeleton";
import {
    type SelectedFee,
    type TransactionSendFormProjectedFeeProperties,
} from "@/Components/TransactionFormSlider/Steps/InitiationStep.contracts";
import { useNetworkFees } from "@/Hooks/useNetworkFees";
import { formatCrypto, formatFiat } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

export const calculateGasFee = (
    token: App.Data.TokenListItemData,
    maxFee: string | number,
    nativeToken: TokenData,
): string => {
    // A typical ERC20 transfer uses around 65000 gas,
    // while native tokens require only 21000:
    // https://etherscan.io/gastracker
    const gasLimit = token.is_native_token ? 21000 : 65000;

    const feeGweiToEth = ethers.utils.parseUnits(Number(maxFee).toFixed(9).toString(), "gwei");
    const feeEth = ethers.utils.formatEther(feeGweiToEth);

    return (Number(feeEth) * gasLimit).toFixed(nativeToken.decimals);
};

export const TransactionSendFormProjectedFee = ({
    asset,
    nativeToken,
    nativeTokenPrice,
    selectedFee,
    currency,
    onChange,
}: TransactionSendFormProjectedFeeProperties): JSX.Element => {
    const { t } = useTranslation();

    const { networkFees, error, isLoading } = useNetworkFees({ chainId: nativeToken?.chainId });

    const hasError = error !== null;

    useEffect(() => {
        if (networkFees === undefined || isLoading) {
            return;
        }

        const averageFee = networkFees.find((fee) => fee.type === "Avg") as SelectedFee;

        onChange(averageFee);
    }, [hasError, networkFees, isLoading]);

    const transactionTime: { Fast: string; Avg: string; Slow: string } = {
        Fast: "2",
        Avg: "5",
        Slow: "10",
    };

    const feeDepsLoaded = isTruthy(selectedFee) && isTruthy(nativeToken);

    const gasFee = feeDepsLoaded && isTruthy(asset) ? calculateGasFee(asset, selectedFee.maxFee, nativeToken) : "0";

    const getNativeTokenFee = (): ReactNode => {
        // show an empty string as native fee if asset is not selected yet
        if (asset === undefined) {
            return "";
        }

        if (!feeDepsLoaded || isLoading) {
            return (
                <Skeleton
                    data-testid="TransactionSendForm_FeeLoader"
                    width={70}
                    height={16}
                />
            );
        }

        // NOTE: `formatCrypto` requires the value to be in `wei` while we got it as 'eth' due to the previous calculation.
        const gasFeeWei = ethers.utils.parseEther(gasFee);
        const amount = formatCrypto({
            value: gasFeeWei.toString(),
            token: nativeToken,
            t,
        });

        return `${amount} ${nativeToken.symbol}`;
    };

    const getTransactionTime = (): ReactNode => {
        // show ~N/A minutes if asset is not selected yet
        if (asset === undefined) {
            return t("pages.send_receive_panel.send.transaction_time", {
                time: "N/A",
                interpolation: { escapeValue: false },
            });
        }

        if (selectedFee !== undefined && !isLoading) {
            return t("pages.send_receive_panel.send.transaction_time", {
                time: transactionTime[selectedFee.type],
            });
        }

        return (
            <span data-testid="TransactionSendForm_NativeTokenLoader">
                <Skeleton
                    width={90}
                    height={16}
                />
            </span>
        );
    };

    return (
        <div className="mt-4">
            <InputGroup
                label={t("pages.send_receive_panel.send.labels.projected_fee")}
                data-testid="TransactionSendForm_Fee"
                hint={[getNativeTokenFee(), getTransactionTime()]}
            >
                <Listbox
                    data-testid="TransactionSendForm_Fee_Select"
                    onChange={onChange}
                    buttonClassName={cn("sm:max-w-[160px]", hasError && "!z-0")}
                    label={selectedFee?.type}
                    hasError={hasError}
                    disabled={!feeDepsLoaded}
                    placeholder="Fast"
                    after={
                        <span className="relative block w-full">
                            <Listbox.Input
                                disabled
                                data-testid="TransactionSendForm_FeeFiat_Input"
                                hasError={hasError}
                                value={
                                    nativeTokenPrice != null
                                        ? `~${formatFiat({
                                              t,
                                              value: (
                                                  (nativeTokenPrice.price[currency]?.price ?? 0) * +gasFee
                                              ).toString(),
                                              currency,
                                              maxDecimals: 3,
                                          })}`
                                        : ""
                                }
                                placeholder="~$0.00"
                            />

                            {asset !== undefined && (isLoading || !feeDepsLoaded) && (
                                <span
                                    className="absolute inset-y-0 ml-3 flex items-center"
                                    data-testid="TransactionSendForm_FeeLoader"
                                >
                                    <Skeleton
                                        width={200}
                                        height={20}
                                    />
                                </span>
                            )}
                        </span>
                    }
                >
                    {networkFees?.map((fee, index) => (
                        <Listbox.Option
                            key={`${index}-${fee.type}`}
                            value={fee}
                        >
                            {t(`pages.send_receive_panel.send.fees.${fee.type}`)}
                        </Listbox.Option>
                    ))}
                </Listbox>
            </InputGroup>
        </div>
    );
};
