import { type QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    articles?: App.Data.Articles.ArticlesData;
    isLoading: boolean;
}

export const useArticles = (
    initialData: App.Data.Articles.ArticlesData,
    rawFilters: Record<string, string> = {},
): Properties => {
    const filters: Record<string, string> = {};

    for (const filter of ["pageLimit", "sort", "search"]) {
        if (filter in rawFilters && isTruthy(rawFilters[filter])) {
            filters[filter] = rawFilters[filter];
        }
    }

    const queryKey: QueryKey = ["articles", filters];

    const { data, isLoading } = useQuery({
        queryKey,
        staleTime: 5000,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        initialData: () => ({
            data: {
                articles: initialData,
            },
        }),
        queryFn: async () =>
            await axios.get<{ articles: App.Data.Articles.ArticlesData }>(route("articles"), {
                params: filters,
            }),
    });

    console.log(queryClient.getQueryCache());
    return {
        articles: data.articles,
        isLoading,
    };
};
