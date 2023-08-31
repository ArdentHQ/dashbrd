export interface CollectionTableItemProperties {
    collection: App.Data.Collections.CollectionData;
    nfts: App.Data.Collections.CollectionNftData[];
    uniqueKey: string;
    user: App.Data.UserData;
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
    nfts: App.Data.Collections.CollectionNftData[];
    user: App.Data.UserData;
    hiddenCollectionAddresses: string[];
    reportByCollectionAvailableIn: Record<string, string | null>;
    alreadyReportedByCollection: Record<string, boolean>;
    reportReasons?: Record<string, string>;
    isLoading?: boolean;
    onLoadMore?: () => void;
    onChanged: () => void;
    activeSort?: string;
    sortDirection?: "asc" | "desc";
    onSort?: (column: string, direction: string) => void;
    onReportCollection?: (address: string) => void;
}
