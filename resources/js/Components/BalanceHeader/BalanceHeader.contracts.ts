export interface BalanceHeaderProperties {
    balance: string;
    tokens?: number;
    address: string;
    currency: string;
    isLoading?: boolean;
    skeletonAnimated?: boolean;
    assets: App.Data.TokenPortfolioData[];
    onSend?: () => void;
    onReceive?: () => void;
}
