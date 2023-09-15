import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isTruthy } from "@/Utils/is-truthy";

export enum LocalStorageKey {
    LastTransactionSentAt = "LastTransactionSentAt",
}

export const useLocalStorage = <T>(
    key: LocalStorageKey,
    initialState?: T,
): [state: T | null, setState: (newState: T) => void] => {
    const queryClient = useQueryClient();
    const queryKey = [`localstorage:${key}`];

    const setState = (newState?: T): void => {
        localStorage.setItem(key, JSON.stringify(newState));
        queryClient.setQueryData(queryKey, newState);
    };

    if (!isTruthy(localStorage.getItem(key))) {
        setState(initialState);
    }

    const { data } = useQuery<T | null>(queryKey, async () => {
        const value = localStorage.getItem(key) ?? null;

        if (value === null || value === "undefined") {
            return await Promise.resolve(null);
        }

        return await Promise.resolve(JSON.parse(value) as T);
    });

    return [isTruthy(data) ? data : null, setState];
};
