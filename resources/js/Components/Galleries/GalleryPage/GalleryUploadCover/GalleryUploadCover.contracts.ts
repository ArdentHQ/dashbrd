export interface GalleryUploadCoverProperties {
    onSave?: ({ blob, imageDataURI }: { blob?: File; imageDataURI?: string }) => void;
    onRemove?: () => void;
    onCancel?: () => void;
    coverUrl?: string;
    maxUploadSize?: number;
    maxDimensions?: {
        width: number;
        height: number;
    };
}

export interface ImageUploadActionsProperties {
    onUpload?: () => void;
}

export interface ImageEditActionsProperties extends ImageUploadActionsProperties {
    onRemove?: () => void;
    src: string;
}
