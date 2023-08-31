export type LineChartPriceHistoryData = Record<string, App.Data.PriceHistoryData[] | undefined>;

export interface LineChartPriceHistoryDataContext {
    chartData: LineChartPriceHistoryData | undefined;
    loadedSymbols: string[];
    errored: boolean;
}

export interface WithLineChartDataProperties {
    children: React.ReactNode;
    currency: string;
    symbols: string[];
}
