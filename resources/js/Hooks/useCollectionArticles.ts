import { type QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Properties {
    articles?: App.Data.Articles.ArticlesData;
    isLoading: boolean;
}

export const useCollectionArticles = (collectionSlug: string): Properties => {
    const queryKey: QueryKey = ["collection-articles-" + collectionSlug];

    const { data, isLoading } = useQuery({
        queryKey,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        select: ({ data }) => data,
        queryFn: async () =>
            await axios.get<{ articles: App.Data.Articles.ArticlesData }>(
                route("collections.articles", {
                    slug: collectionSlug,
                }),
            ),
    });

    return {
        articles: data?.articles,
        isLoading,
    };
};
