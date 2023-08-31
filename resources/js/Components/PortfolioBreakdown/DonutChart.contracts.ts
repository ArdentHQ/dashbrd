import { type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";

interface DonutChartProperties {
    assets: App.Data.TokenPortfolioData[];
    currency: string;
    size?: number;
}

interface TooltipProperties {
    dataPoint: GraphDataPoint;
}

export type { DonutChartProperties, TooltipProperties };
