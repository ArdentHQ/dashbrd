import { type PageProps } from "@inertiajs/core";

export interface GalleriesPageProperties {
    stats: App.Data.Gallery.GalleryStatsData;
    auth: PageProps["auth"];
    galleries: {
        popular: App.Data.Gallery.GalleriesData;
        newest: App.Data.Gallery.GalleriesData;
        mostValuable: App.Data.Gallery.GalleriesData;
    };
}

export interface GalleryPageProperties {
    stats: App.Data.Gallery.GalleryStatsData;
    auth: PageProps["auth"];
    galleries: App.Data.Gallery.GalleriesData;
    title: string;
}

export type FilterTypes = "most-popular" | "newest" | "most-valuable";

export interface GalleryFiltersPageProperties {
    auth: PageProps["auth"];
    type: FilterTypes;
}
