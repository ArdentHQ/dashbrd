import { type QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    articles?: App.Data.Articles.ArticlesData;
    isLoading: boolean;
}

export const useArticles = (
    initialData: App.Data.Articles.ArticlesData,
    rawFilters: Record<string, string | boolean> = {},
    enabled = true,
): Properties => {
    const filters: Record<string, string | boolean> = {};

    for (const filter of ["pageLimit", "sort", "search"]) {
        if (filter in rawFilters && isTruthy(rawFilters[filter])) {
            filters[filter] = rawFilters[filter];
        }
    }

    const queryKey: QueryKey = ["articles", filters];

    const { data, isLoading } = useQuery({
        enabled,
        queryKey,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<{ articles: App.Data.Articles.ArticlesData }>(route("articles"), {
                params: filters,
            }),
    });

    return {
        articles: data?.articles,
        isLoading,
    };
};
