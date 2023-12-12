export interface CollectionTableItemProperties {
    collection: App.Data.Collections.CollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
}

export interface CollectionTableProperties {
    collections: App.Data.Collections.CollectionData[];
    user: App.Data.UserData | null;
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
    selectedChainIds?: number[];
}
