import { LocalStorageKey, useLocalStorage } from "./useLocalStorage";

interface Properties {
    requestActivityUpdate: (collectionAddress: string) => void;
    hasReachedMaxRequests: () => boolean;
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
        hasReachedMaxRequests: (): boolean => {
            const allRequests = Object.values(collectionUpdateRequests ?? {});

            const lastHourRequests = allRequests.filter(
                (requestedAt) => new Date().getTime() - requestedAt < 1000 * 60,
            );

            return lastHourRequests.length >= 3;
        },
    };
};
