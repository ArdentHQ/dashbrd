import { LocalStorageKey, useLocalStorage } from "./useLocalStorage";

interface Properties {
    requestActivityUpdate: (collectionAddress: string) => void;
    hasReachedMaxUpdateRequests: () => boolean;
}

export const useWalletActivity = (): Properties => {
    const [collectionUpdateRequests, setLastCollectionUpdateRequest] = useLocalStorage<Record<string, number>>(
        LocalStorageKey.CollectionActivityUpdateRequests,
        {},
    );

    return {
        requestActivityUpdate: (collectionAddress: string) => {
            setLastCollectionUpdateRequest({ [collectionAddress]: new Date().getTime() });
        },
        hasReachedMaxUpdateRequests: (): boolean => {
            const allRequests = Object.values(collectionUpdateRequests ?? {});

            const lastHourRequests = allRequests.filter(
                (requestedAt) => new Date().getTime() - requestedAt < 1000 * 60,
            );

            return lastHourRequests.length >= 3;
        },
    };
};
