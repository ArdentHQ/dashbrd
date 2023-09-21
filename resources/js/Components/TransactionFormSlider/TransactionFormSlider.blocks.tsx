import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
    SendTransactionStep,
    TransactionDirection,
    type TransactionIntent,
    type TransactionSendFormProperties,
} from "./TransactionFormSlider.contracts";
import { Icon } from "@/Components/Icon";
import { Tabs } from "@/Components/Tabs";
import { Tooltip } from "@/Components/Tooltip";
import { ExecutionStep } from "@/Components/TransactionFormSlider/Steps/ExecutionStep";
import { InitiationStep } from "@/Components/TransactionFormSlider/Steps/InitiationStep";
import { ResultStep } from "@/Components/TransactionFormSlider/Steps/ResultStep";

export const TransactionFormSliderHeader = ({
    onChange,
    balance,
}: {
    onChange: (direction: TransactionDirection) => void;
    balance?: number;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.List
            data-testid="TransactionFormSliderHeader"
            className="w-[calc(100%-2.875rem)] sm:w-full"
        >
            <Tabs className="sm:w-full">
                <Tab as={Fragment}>
                    {({ selected }) => (
                        <Tabs.Button
                            disabled={balance === 0}
                            selected={selected}
                            className="basis-1/2 space-x-3"
                            onClick={() => {
                                onChange(TransactionDirection.Send);
                            }}
                            data-testid="TransactionFormSliderHeader__tab1"
                        >
                            <Tooltip
                                content={t("pages.token_panel.insufficient_funds")}
                                disabled={balance !== 0}
                                touch={balance === 0}
                            >
                                <div className="flex w-full items-center justify-center space-x-3">
                                    <span data-testid="TransactionFormSlider__tab-send">{t("common.send")}</span>
                                    <Icon name="FatArrowUp" />
                                </div>
                            </Tooltip>
                        </Tabs.Button>
                    )}
                </Tab>

                <Tab as={Fragment}>
                    {({ selected }) => (
                        <Tabs.Button
                            selected={selected}
                            className="basis-1/2 space-x-3"
                            onClick={() => {
                                onChange(TransactionDirection.Receive);
                            }}
                            data-testid="TransactionFormSliderHeader__tab2"
                        >
                            <span data-testid="TransactionFormSlider__tab-receive">{t("common.receive")}</span>
                            <Icon name="FatArrowDown" />
                        </Tabs.Button>
                    )}
                </Tab>
            </Tabs>
        </Tab.List>
    );
};

export const TransactionSendForm = ({
    assets,
    balance,
    onClose,
    step,
    setStep,
    currency,
    transactionIntent,
    dispatch,
    user,
}: TransactionSendFormProperties): JSX.Element => {
    const renderStep = (): JSX.Element => {
        switch (step) {
            case SendTransactionStep.Initiation:
                return (
                    <InitiationStep
                        balance={balance}
                        currency={currency}
                        assets={assets}
                        onClose={onClose}
                        setStep={setStep}
                        transactionIntent={transactionIntent}
                        dispatch={dispatch}
                    />
                );
            case SendTransactionStep.Execution:
                return (
                    <ExecutionStep
                        userCurrency={currency}
                        transactionIntent={transactionIntent as Required<Omit<TransactionIntent, "hash">>}
                        dispatch={dispatch}
                        setStep={setStep}
                    />
                );
            case SendTransactionStep.Result:
            default:
                return (
                    <ResultStep
                        user={user}
                        onClose={onClose}
                        transactionIntent={transactionIntent as Required<TransactionIntent>}
                    />
                );
        }
    };

    return <div data-testid="TransactionSendForm">{renderStep()}</div>;
};
