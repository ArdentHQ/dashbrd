import { type QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isTruthy } from "@/Utils/is-truthy";

interface ArticlesResponse {
    articles?: App.Data.Articles.ArticlesData;
    highlightedArticles?: App.Data.Articles.ArticleData[];
}

interface Properties extends ArticlesResponse {
    isLoading: boolean;
}

export const useArticles = (rawFilters: Record<string, string> = {}, enabled = true): Properties => {
    const filters: Record<string, string> = {};

    for (const filter of ["pageLimit", "sort", "search", "page"]) {
        if (filter in rawFilters && isTruthy(rawFilters[filter])) {
            filters[filter] = rawFilters[filter];
        }
    }

    const queryKey: QueryKey = ["articles", filters];

    const { data, isLoading } = useQuery({
        enabled,
        queryKey,
        refetchOnWindowFocus: false,
        staleTime: Number.POSITIVE_INFINITY,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<ArticlesResponse>(route("articles"), {
                params: filters,
            }),
    });

    return {
        articles: data?.articles,
        highlightedArticles: data?.highlightedArticles,
        isLoading,
    };
};
