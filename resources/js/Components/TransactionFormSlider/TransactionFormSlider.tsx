import { Tab } from "@headlessui/react";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransactionFormSliderHeader, TransactionSendForm } from "./TransactionFormSlider.blocks";
import {
    ActionType,
    SendTransactionStep,
    TransactionDirection,
    type TransactionFormSliderProperties,
    type TransactionIntent,
    type TransactionIntentActions,
    TransactionState,
} from "./TransactionFormSlider.contracts";
import { TransactionReceiveForm } from "./TransactionReceiveForm";
import { Slider } from "@/Components/Slider";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { isTruthy } from "@/Utils/is-truthy";

export const transactionIntentReducer = (
    state: TransactionIntent,
    action: TransactionIntentActions,
): TransactionIntent => {
    switch (action.type) {
        case ActionType.SetAsset:
            return { ...state, asset: action.payload };
        case ActionType.SetAmount:
            return { ...state, amount: action.payload };
        case ActionType.SetFee:
            return { ...state, fee: action.payload };
        case ActionType.SetRecipient:
            return { ...state, recipient: action.payload };
        case ActionType.SetNativeToken:
            return { ...state, nativeToken: action.payload };
        case ActionType.SetNativeTokenPrice:
            return { ...state, nativeTokenPrice: action.payload };
        case ActionType.SetState:
            return { ...state, state: action.payload };
        case ActionType.SetHash:
            return { ...state, hash: action.payload };
        case ActionType.Reset:
            return { ...initialState };
        default:
            return state;
    }
};

const initialState = {
    asset: undefined,
    recipient: undefined,
    amount: undefined,
    fee: undefined,
    state: TransactionState.Idle,
    nativeToken: undefined,
    nativeTokenPrice: undefined,
    gasLimit: "21000",
    hash: undefined,
};

export const TransactionFormSlider = ({
    isOpen,
    onClose,
    direction = TransactionDirection.Send,
    asset,
    assets,
    balance,
    currency,
    wallet,
    user,
}: TransactionFormSliderProperties): JSX.Element => {
    const { t } = useTranslation();

    const [activeDirection, setActiveDirection] = useState(direction);
    const [step, setStep] = useState<SendTransactionStep>(SendTransactionStep.Initiation);

    const [transactionIntent, dispatch] = useReducer(transactionIntentReducer, initialState);

    useEffect(() => {
        setActiveDirection(direction);
    }, [direction]);

    useEffect(() => {
        setStep(SendTransactionStep.Initiation);

        dispatch({ type: ActionType.Reset });
        asset !== undefined && dispatch({ type: ActionType.SetAsset, payload: asset });
    }, [isOpen, asset]);

    return (
        <Slider
            data-testid="TransactionFormSlider"
            isOpen={Boolean(isOpen)}
            onClose={onClose}
            panelClassName="translate-x-0"
        >
            <Tab.Group defaultIndex={direction}>
                <Slider.Header>
                    <TransactionFormSliderHeader
                        onChange={setActiveDirection}
                        balance={balance}
                    />
                </Slider.Header>

                <Slider.Content>
                    <Tab.Panels>
                        <Tab.Panel>
                            <TransactionSendForm
                                user={user}
                                assets={assets}
                                balance={balance}
                                step={step}
                                currency={currency}
                                setStep={setStep}
                                onClose={onClose}
                                transactionIntent={transactionIntent}
                                dispatch={dispatch}
                            />
                        </Tab.Panel>
                        <Tab.Panel>
                            <TransactionReceiveForm wallet={wallet} />
                        </Tab.Panel>
                    </Tab.Panels>

                    {activeDirection === TransactionDirection.Receive && (
                        <SliderFormActionsToolbar
                            onCancel={onClose}
                            hasSave={false}
                            cancelButtonLabel={isTruthy(asset) ? t("common.back") : t("common.close")}
                        />
                    )}
                </Slider.Content>
            </Tab.Group>
        </Slider>
    );
};
