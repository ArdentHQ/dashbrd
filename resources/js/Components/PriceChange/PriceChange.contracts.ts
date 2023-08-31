export type PriceChangeType = "neutral" | "positive" | "negative";

export interface PriceChangeProperties {
    change: number;
    className?: string;
}
