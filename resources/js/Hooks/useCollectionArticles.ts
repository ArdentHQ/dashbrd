import { type QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    articles?: App.Data.Articles.ArticlesData;
    isLoading: boolean;
}

export const useCollectionArticles = (collectionSlug: string, rawFilters: Record<string, string> = {}): Properties => {
    const filters: Record<string, string> = {};

    for (const filter of ["pageLimit", "sort", "search"]) {
        if (filter in rawFilters && isTruthy(rawFilters[filter])) {
            filters[filter] = rawFilters[filter];
        }
    }

    const queryKey: QueryKey = ["collection-articles-" + collectionSlug + "-" + JSON.stringify(filters)];

    const { data, isLoading } = useQuery({
        queryKey,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<{ articles: App.Data.Articles.ArticlesData }>(
                route("collections.articles", { slug: collectionSlug }),
                {
                    params: filters,
                },
            ),
    });

    return {
        articles: data?.articles,
        isLoading,
    };
};
