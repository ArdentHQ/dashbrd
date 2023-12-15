import { type PopularCollectionsSortBy } from "@/Pages/Collections/Components/PopularCollectionsSorting";
import { type SortByDirection } from "@/Pages/Collections/Hooks/useCollectionFilters";

export interface CollectionTableItemProperties {
    collection: App.Data.Collections.CollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
}

export interface CollectionTableProperties {
    collections: App.Data.Collections.CollectionData[];
    user: App.Data.UserData | null;
    setSortBy: (sortBy: PopularCollectionsSortBy | undefined, direction?: SortByDirection) => void;
    activeSort: PopularCollectionsSortBy | "";
    direction?: SortByDirection;
}
