import { type PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";

export interface PopularCollectionTableItemProperties {
    collection: App.Data.Collections.PopularCollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
}

export interface PopularCollectionTableProperties {
    collections: App.Data.Collections.PopularCollectionData[];
    user: App.Data.UserData | null;
    period?: PeriodFilterOptions;
    activePeriod?: PeriodFilterOptions;
    isLoading?: boolean
}
