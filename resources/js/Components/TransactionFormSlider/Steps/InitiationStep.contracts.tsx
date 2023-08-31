import { type Dispatch } from "react";
import TokenData = App.Data.Token.TokenData;
import TokenPriceData = App.Data.Token.TokenPriceData;
import {
    type SendTransactionStep,
    type TransactionIntent,
    type TransactionIntentActions,
} from "@/Components/TransactionFormSlider";

export interface SelectedFee {
    type: "Fast" | "Avg" | "Slow";
    maxFee: string | number;
    maxPriorityFee: string | number;
}

export interface TransactionSendFormProjectedFeeProperties {
    asset?: App.Data.TokenListItemData;
    nativeToken?: TokenData;
    nativeTokenPrice?: TokenPriceData;
    selectedFee?: SelectedFee;
    currency: string;
    onChange: (fee: SelectedFee) => void;
}

export interface InitiationStepProperties {
    onClose: () => void;
    setStep: (t: SendTransactionStep) => void;
    balance: number;
    currency: string;
    assets: App.Data.TokenListItemData[];
    transactionIntent: TransactionIntent;
    dispatch: Dispatch<TransactionIntentActions>;
}
