export interface BalanceHeaderProperties {
    balance: string;
    tokens?: number;
    address: string;
    currency: string;
    isLoading?: boolean;
    skeletonDisabled?: boolean;
    assets: App.Data.TokenPortfolioData[];
    onSend?: () => void;
    onReceive?: () => void;
}
