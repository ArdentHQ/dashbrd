export interface CollectionTableItemProperties {
    collection: App.Data.Collections.CollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
    isHidden: boolean;
    reportAvailableIn?: string | null;
    alreadyReported?: boolean | null;
    reportReasons?: Record<string, string>;
    onVisible?: () => void;
    onChanged: () => void;
    onReportCollection?: (address: string) => void;
}

export interface CollectionTableProperties {
    collections: App.Data.Collections.CollectionData[];
    user: App.Data.UserData | null;
    hiddenCollectionAddresses: string[];
    reportByCollectionAvailableIn: Record<string, string | null>;
    alreadyReportedByCollection: Record<string, boolean>;
    reportReasons?: Record<string, string>;
    isLoading?: boolean;
    onLoadMore?: () => void;
    onChanged: () => void;
    activeSort?: string;
    sortDirection?: "asc" | "desc";
    onSort?: ({
        sortBy,
        direction,
        selectedChainIds,
    }: {
        sortBy: string;
        direction?: string;
        selectedChainIds?: number[];
    }) => void;
    onReportCollection?: (address: string) => void;
    selectedChainIds?: number[];
}
