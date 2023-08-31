import { ethers } from "ethers";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { InputGroup } from "@/Components/Form/InputGroup";
import { TextInput } from "@/Components/Form/TextInput";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { ActionType, SendTransactionStep } from "@/Components/TransactionFormSlider";
import { SelectAsset } from "@/Components/TransactionFormSlider/Components/SelectAsset";
import { TransactionAmountInput } from "@/Components/TransactionFormSlider/Components/TransactionAmountInput";
import {
    calculateGasFee,
    TransactionSendFormProjectedFee,
} from "@/Components/TransactionFormSlider/Steps/InitiationStep.blocks";

import {
    type InitiationStepProperties,
    type SelectedFee,
} from "@/Components/TransactionFormSlider/Steps/InitiationStep.contracts";

import { type NativeTokenResponse, useNativeToken } from "@/Hooks/useNativeToken";
import { isTruthy } from "@/Utils/is-truthy";
import { validateAddress } from "@/Utils/validate-address";

const isValidAmount = (selectedAmount: number | string, maxAmount: number): boolean => {
    const amount = Number(selectedAmount);
    return amount > 0 && amount <= maxAmount;
};

export const InitiationStep = ({
    assets: initialAssets,
    onClose,
    balance,
    currency,
    transactionIntent,
    dispatch,
    setStep,
}: InitiationStepProperties): JSX.Element => {
    const { t } = useTranslation();

    const [usingMaxAmount, setUsingMaxAmount] = useState<boolean>(false);

    const { recipient: toAddress, amount, asset, fee, nativeToken, nativeTokenPrice } = transactionIntent;

    const [isInvalidToAddress, setIsInvalidToAddress] = useState<boolean>(() =>
        isTruthy(toAddress) ? !validateAddress(toAddress) : false,
    );

    const isAssetDefined = asset !== undefined;

    const formattedBalance = isAssetDefined ? ethers.utils.formatUnits(asset.balance, asset.decimals) : "0";

    const feeDepsLoaded = isTruthy(fee) && isTruthy(nativeToken);

    const gasFee = feeDepsLoaded && isTruthy(asset) ? calculateGasFee(asset, fee.maxFee, nativeToken) : undefined;

    const useNativeTokenFee = feeDepsLoaded && isTruthy(asset) && isTruthy(asset.is_native_token);

    const maxAmount =
        useNativeTokenFee && gasFee !== undefined
            ? Number(formattedBalance) - Number(gasFee)
            : Number(formattedBalance);

    const [isInvalidAmount, setIsInvalidAmount] = useState<boolean>(() =>
        isTruthy(amount) ? !isValidAmount(amount, maxAmount) : false,
    );

    useEffect(() => {
        if (!usingMaxAmount) {
            return;
        }

        handleSelectMaxAmount();
    }, [maxAmount, usingMaxAmount]);

    useNativeToken({
        asset,
        onResolve: (data: NativeTokenResponse) => {
            dispatch({ type: ActionType.SetNativeToken, payload: data.token });
            dispatch({ type: ActionType.SetNativeTokenPrice, payload: data.tokenPrice });
        },
    });

    initialAssets = initialAssets.filter((asset) => Number(asset.balance) !== 0).slice(0, 5);
    const referenceInitialAssets = useRef(initialAssets);

    const isReady =
        !isInvalidToAddress &&
        !isInvalidAmount &&
        Object.entries(transactionIntent).every(([key, value]) => (key !== "hash" ? isTruthy(value) : true));

    const handleSelectAsset = (asset: App.Data.TokenListItemData): void => {
        dispatch({ type: ActionType.SetAmount, payload: undefined });
        dispatch({ type: ActionType.SetAsset, payload: asset });

        setIsInvalidAmount(false);
    };

    const handleSelectFee = (fee: SelectedFee): void => {
        dispatch({ type: ActionType.SetFee, payload: fee });
    };

    const handleChangeDestinationAddress = (event: ChangeEvent<HTMLInputElement>): void => {
        const recipient = event.target.value;
        dispatch({ type: ActionType.SetRecipient, payload: recipient });

        setIsInvalidToAddress(recipient.length > 0 && !validateAddress(recipient));
    };

    const handleChangeAmount = (amount: string | number): void => {
        dispatch({ type: ActionType.SetAmount, payload: amount });

        setIsInvalidAmount(!isValidAmount(amount, maxAmount));

        setUsingMaxAmount(Number(amount) === maxAmount);
    };

    const handleSelectMaxAmount = (): void => {
        dispatch({ type: ActionType.SetAmount, payload: String(maxAmount) });

        setIsInvalidAmount(false);

        setUsingMaxAmount(true);
    };

    const amountError = isInvalidAmount && Number(amount) > 0 ? t("pages.send_receive_panel.send.errors.amount") : "";

    return (
        <form data-testid="Transaction__InitiationStep">
            <SelectAsset
                balance={formattedBalance}
                assets={referenceInitialAssets.current}
                currency={currency}
                asset={asset}
                onSelectAsset={handleSelectAsset}
                error={amountError}
                after={
                    <TransactionAmountInput
                        error={amountError}
                        asset={asset}
                        amount={amount}
                        onAmountChange={handleChangeAmount}
                        onSelectMaxAmount={handleSelectMaxAmount}
                    />
                }
            />

            <div className="mt-4">
                <InputGroup
                    error={isInvalidToAddress ? t("pages.send_receive_panel.send.errors.destination") : ""}
                    label={t("pages.send_receive_panel.send.labels.destination_address")}
                >
                    {({ hasError }) => (
                        <TextInput
                            disabled={balance === 0}
                            data-testid="TransactionSendForm_Destination"
                            value={toAddress ?? ""}
                            onChange={handleChangeDestinationAddress}
                            placeholder={t("pages.send_receive_panel.send.placeholders.insert_recipient_address")}
                            hasError={hasError}
                            before={
                                <TextInput.Avatar>
                                    {isTruthy(toAddress) ? (
                                        <Avatar
                                            address={toAddress}
                                            size={32}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-theme-primary-100"></div>
                                    )}
                                </TextInput.Avatar>
                            }
                        />
                    )}
                </InputGroup>
            </div>

            <TransactionSendFormProjectedFee
                nativeToken={nativeToken}
                nativeTokenPrice={nativeTokenPrice}
                selectedFee={fee}
                asset={asset}
                currency={currency}
                onChange={handleSelectFee}
            />

            <SliderFormActionsToolbar
                onCancel={onClose}
                cancelButtonLabel={isTruthy(asset) ? t("common.back") : t("common.close")}
                saveButtonLabel={t("common.continue")}
                isSaveEnabled={isReady}
                onSave={() => {
                    setStep(SendTransactionStep.Execution);
                }}
            />
        </form>
    );
};
