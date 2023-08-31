export enum GalleryFormSliderTabs {
    Template = 0,
    Cover = 1,
}

export interface GalleryFormSliderProperties {
    activeTab?: GalleryFormSliderTabs;
    isOpen: boolean;
    onClose: () => void;
    galleryCoverUrl?: string;
    onSaveCoverUrl?: ({ blob, imageDataURI }: { blob?: Blob; imageDataURI?: string }) => void;
}
