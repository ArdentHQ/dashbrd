import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import {
    ActionType,
    AddressingOverview,
    SendTransactionStep,
    TransactionBreakdown,
    TransactionState,
} from "@/Components/TransactionFormSlider";
import { FailedMessage, WaitingMessage } from "@/Components/TransactionFormSlider/Steps/ExecutionStep.blocks";
import { type ExecutionStepProperties } from "@/Components/TransactionFormSlider/Steps/ExecutionStep.contracts";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { LocalStorageKey, useLocalStorage } from "@/Hooks/useLocalStorage";

export const ExecutionStep = ({ setStep, dispatch, ...properties }: ExecutionStepProperties): JSX.Element => {
    const { t } = useTranslation();
    const { sendTransaction, account, chainId, switchToNetwork } = useMetaMaskContext();
    const [, setLastTransactionSentAt] = useLocalStorage<number | null>(LocalStorageKey.LastTransactionSentAt, null);

    const { registerTransaction } = useTransactionSliderContext();

    const { state: transactionState, recipient, amount, asset, fee, nativeToken } = properties.transactionIntent;

    const requiresSwitch = nativeToken.chainId !== chainId;

    const setTransactionState = (state: TransactionState): void => {
        dispatch({ type: ActionType.SetState, payload: state });
    };

    useEffect(() => {
        if (transactionState !== TransactionState.Idle) {
            return;
        }
        const send = async (): Promise<void> => {
            setTransactionState(TransactionState.InProgress);

            try {
                if (requiresSwitch) {
                    await switchToNetwork(nativeToken.chainId);
                }

                const response = await sendTransaction({
                    recipient,
                    amount: amount.toString(),
                    token: asset,
                    maxFeePerGas: fee.maxFee.toString(),
                    maxPriorityFeePerGas: fee.maxPriorityFee.toString(),
                });

                if (response.errorMessage !== undefined || response.hash === undefined) {
                    setTransactionState(TransactionState.Failed);
                    return;
                }

                dispatch({ type: ActionType.SetHash, payload: response.hash });

                void registerTransaction({
                    hash: response.hash,
                    asset,
                });

                setTransactionState(TransactionState.Executed);
                setLastTransactionSentAt(new Date().getTime());

                setStep(SendTransactionStep.Result);
            } catch (error) {
                setTransactionState(TransactionState.Failed);
            }
        };

        void send();
    }, [transactionState, requiresSwitch]);

    return (
        <div
            className="h-screen md:h-auto"
            data-testid="Transaction__ExecutionStep"
        >
            <AddressingOverview
                fromAddress={account}
                toAddress={recipient}
            />

            <TransactionBreakdown {...properties} />
            {transactionState === TransactionState.InProgress && <WaitingMessage />}
            {transactionState === TransactionState.Failed && (
                <>
                    <FailedMessage />
                    <SliderFormActionsToolbar
                        onCancel={() => {
                            setTransactionState(TransactionState.Idle);
                            setStep(SendTransactionStep.Initiation);
                        }}
                        hasSave={true}
                        cancelButtonLabel={t("common.back")}
                        saveButtonLabel={t("common.retry")}
                        isSaveEnabled={true}
                        onSave={() => {
                            setTransactionState(TransactionState.Idle);
                        }}
                    />
                </>
            )}
        </div>
    );
};
