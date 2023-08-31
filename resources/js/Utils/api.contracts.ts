import { type Period } from "@/Components/Tokens/Tokens.contracts";

export interface GetPriceHistoryProperties {
    token: string;
    currency: string;
    period: Period;
    sample?: number;
}

export interface FeeData {
    type: string;
    maxFee: string;
    maxPriorityFee: string;
}

export interface FeesData {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
    UsdPrice?: string;
}
