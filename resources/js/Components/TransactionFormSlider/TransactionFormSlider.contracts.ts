import { type Dispatch } from "react";
import TokenData = App.Data.Token.TokenData;
import TokenPriceData = App.Data.Token.TokenPriceData;
import { type SelectedFee } from "@/Components/TransactionFormSlider/Steps/InitiationStep.contracts";

export enum TransactionDirection {
    Send = 0,
    Receive = 1,
}

export interface TransactionFormSliderProperties {
    direction?: TransactionDirection;
    isOpen?: boolean;
    onClose: () => void;
    asset?: App.Data.TokenListItemData;
    currency: string;
    assets: App.Data.TokenListItemData[];
    balance: number;
    wallet: App.Data.Wallet.WalletData;
    user: App.Data.UserData;
}

export interface TransactionSendFormProperties {
    assets: App.Data.TokenListItemData[];
    step: SendTransactionStep;
    setStep: (s: SendTransactionStep) => void;
    onClose: () => void;
    currency: string;
    balance: number;
    transactionIntent: TransactionIntent;
    dispatch: Dispatch<TransactionIntentActions>;
    user: App.Data.UserData;
}

export enum TransactionState {
    Idle = "Idle",
    InProgress = "InProgress",
    Failed = "Failed",
    Executed = "Executed",
}

export enum SendTransactionStep {
    Initiation = "Initiation",
    Execution = "Execution",
    Result = "Result",
}

export interface TransactionIntent {
    asset?: App.Data.TokenListItemData;
    recipient?: string;
    amount?: number | string;
    fee?: SelectedFee;
    state: TransactionState;
    nativeToken?: TokenData;
    nativeTokenPrice?: TokenPriceData;
    gasLimit?: string;
    hash?: string;
}

export enum ActionType {
    SetAsset = "SetAsset",
    SetAmount = "SetAmount",
    SetRecipient = "SetRecipient",
    SetFee = "SetFee",
    SetNativeToken = "SetNativeToken",
    SetNativeTokenPrice = "SetNativeTokenPrice",
    SetState = "SetState",
    SetGasLimit = "SetGasLimit",
    Reset = "Reset",
    SetHash = "SetHash",
}

export type TransactionIntentActions =
    | { type: ActionType.SetAsset; payload: App.Data.TokenListItemData }
    | { type: ActionType.Reset }
    | { type: ActionType.SetAmount; payload?: number | string }
    | { type: ActionType.SetRecipient; payload: string }
    | { type: ActionType.SetFee; payload: SelectedFee }
    | { type: ActionType.SetNativeToken; payload: TokenData }
    | { type: ActionType.SetNativeTokenPrice; payload: TokenPriceData }
    | { type: ActionType.SetState; payload: TransactionState }
    | { type: ActionType.SetGasLimit; payload: string }
    | { type: ActionType.SetHash; payload: string };
