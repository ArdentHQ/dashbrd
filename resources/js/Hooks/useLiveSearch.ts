import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

const THROTTLE_TIMEOUT = 500;

interface Properties<T> {
    request: (query: string) => Promise<T>;
    onResult?: (result?: T) => void;
    onError?: (error: unknown) => void;
    defaultValue?: T;
}

export const useLiveSearch = <T>({
    request,
    onResult,
    onError,
    defaultValue,
}: Properties<T>): { query: string; setQuery: (query: string) => void; loading: boolean } => {
    const queryParameter = new URLSearchParams(window.location.search).get("query") ?? "";
    const [loading, setLoading] = useState(false);
    const [initialSearchQuery] = useState(queryParameter);
    const [query, setQuery] = useState(queryParameter);
    const [throttledQuery, setThrottledQuery] = useState<string>(queryParameter);
    const [searchedQuery, setSearchedQuery] = useState<string>(queryParameter);

    const doSearch = useCallback(
        async (searchQuery: string): Promise<void> => {
            if (searchQuery === initialSearchQuery) {
                onResult?.(defaultValue);
                setSearchedQuery(searchQuery);
                // We need to manually add the query to the url since the
                // request method who does this is not called when the query
                // is the same as the initialSearchQuery.
                replaceUrlQuery({
                    query: searchQuery,
                });
                return;
            }

            try {
                const result = await request(searchQuery);
                onResult?.(result);
                setSearchedQuery(searchQuery);

                // Note: When results are found, the loading state is reset using an
                // observer (useEffect) of searchedQuery (see below).
                // This is done to allow the component using this hook to assign the
                // results to a state before changing the state to "not loading".
            } catch (error) {
                if (!axios.isCancel(error)) {
                    onError?.(error);
                }

                setLoading(false);
            }
        },
        [initialSearchQuery, onResult, request, onError, defaultValue],
    );

    useEffect(() => {
        setLoading(true);

        const timeout = setTimeout(() => {
            setThrottledQuery(query);
        }, THROTTLE_TIMEOUT);

        return () => {
            clearTimeout(timeout);
        };
    }, [query]);

    useEffect(() => {
        if (throttledQuery === searchedQuery) {
            return;
        }

        void doSearch(throttledQuery);
    }, [throttledQuery, searchedQuery]);

    useEffect(() => {
        // Resetting the loading state here as a way to allow the component
        // using this hook to assign the results to a state before changing
        // See the comment in doSearch() above.
        setLoading(false);
    }, [searchedQuery]);

    return {
        loading,
        query,
        setQuery,
    };
};
