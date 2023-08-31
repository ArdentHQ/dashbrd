import axios from "axios";
import { useState } from "react";
import { GRAPH_BACKGROUND_COLORS } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";

export const usePortfolioBreakdown = (): {
    assets: App.Data.TokenPortfolioData[];
    loading: boolean;
    loadBreakdown: () => Promise<void>;
} => {
    const [loading, setLoading] = useState<boolean>(true);
    const [assets, setAssets] = useState<App.Data.TokenPortfolioData[]>([]);

    const loadBreakdown = async (): Promise<void> => {
        setLoading(true);

        const { data } = await axios.get<App.Data.TokenPortfolioData[]>(
            route("tokens.breakdown", {
                top_count: GRAPH_BACKGROUND_COLORS.length - 1,
            }),
        );

        setAssets(data);

        setLoading(false);
    };

    return {
        assets,
        loading,
        loadBreakdown,
    };
};
