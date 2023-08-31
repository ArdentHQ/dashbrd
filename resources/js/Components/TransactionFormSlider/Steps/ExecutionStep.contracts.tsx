import { type Dispatch } from "react";
import {
    type SendTransactionStep,
    type TransactionIntent,
    type TransactionIntentActions,
} from "@/Components/TransactionFormSlider";

export interface ExecutionStepProperties {
    setStep: (s: SendTransactionStep) => void;
    dispatch: Dispatch<TransactionIntentActions>;
    transactionIntent: Required<Omit<TransactionIntent, "hash">>;
    userCurrency: string;
}
