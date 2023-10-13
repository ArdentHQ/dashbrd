import { useEffect, useReducer } from "react";
import { ArticlesView, getArticlesInitialState } from "@/Pages/Articles/Components/ArticlesView";
import { articlesViewReducer } from "@/Pages/Articles/Hooks/useArticlesView";
import { useCollectionArticles } from "@/Pages/Collections/Hooks/useCollectionArticles";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

export const ArticlesTab = ({ collection }: { collection: App.Data.Collections.CollectionDetailData }): JSX.Element => {
    const [articlesState, dispatch] = useReducer(articlesViewReducer, getArticlesInitialState());

    const { debouncedQuery, sort, pageLimit, displayType } = articlesState;

    const queryParameters = {
        search: debouncedQuery,
        sort,
        pageLimit: pageLimit.toString(),
    };

    const { articles, isLoading } = useCollectionArticles(collection.slug, queryParameters);

    useEffect(() => {
        replaceUrlQuery({
            ...queryParameters,
            view: displayType,
            tab: "articlesTab",
        });
    }, [debouncedQuery, sort, pageLimit]);

    return (
        <ArticlesView
            articles={articles}
            isLoading={isLoading}
            articlesState={articlesState}
            dispatch={dispatch}
            mode="collection"
        />
    );
};
