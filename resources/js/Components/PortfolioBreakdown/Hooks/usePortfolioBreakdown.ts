import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GRAPH_BACKGROUND_COLORS } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";

export const usePortfolioBreakdown = (): {
    assets: App.Data.TokenPortfolioData[];
    isLoading: boolean;
} => {
    const { data, isLoading } = useQuery({
        queryKey: ["breakdown"],
        staleTime: 300000, // 5 minutes
        refetchInterval: 300000, // 5 minutes
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<App.Data.TokenPortfolioData[]>(
                route("tokens.breakdown", {
                    top_count: GRAPH_BACKGROUND_COLORS.length - 1,
                }),
            ),
    });

    return {
        assets: data ?? [],
        isLoading,
    };
};
