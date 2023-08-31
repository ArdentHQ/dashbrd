import { type ImageEditActionsProperties, type ImageUploadActionsProperties } from "./GalleryUploadCover.contracts";
import { IconButton } from "@/Components/Buttons";
import { Img } from "@/Components/Image";

export const ImageUploadActions = ({ onUpload }: ImageUploadActionsProperties): JSX.Element => (
    <div
        data-testid="ImageUploadActions"
        className="flex h-full items-center justify-center rounded-xl border border-theme-secondary-300"
    >
        <IconButton
            data-testid="ImageUploadActions__button"
            icon="Upload"
            onClick={onUpload}
        />
    </div>
);

export const ImageEditActions = ({ src, onRemove, onUpload }: ImageEditActionsProperties): JSX.Element => (
    <div
        data-testid="ImageEditActions"
        className="group md:backdrop-blur-md"
    >
        <div className="transition-default absolute inset-0 z-10 flex items-center justify-center rounded-xl opacity-100 group-hover:opacity-100 md:bg-white/30 md:opacity-0 md:backdrop-blur-md">
            <div className="flex h-full items-end justify-center pb-4 md:items-center md:pb-0">
                <div className="flex items-center space-x-3 rounded-full bg-theme-hint-50/50 p-1 backdrop-blur-lg backdrop-filter md:bg-white/30">
                    <IconButton
                        data-testid="ImageEditActions__upload"
                        icon="Upload"
                        onClick={onUpload}
                    />

                    <IconButton
                        data-testid="ImageEditActions__remove"
                        variant="danger"
                        icon="Trash"
                        onClick={onRemove}
                    />
                </div>
            </div>
        </div>

        <Img
            src={src}
            className="aspect-[3/2] min-w-full rounded-xl object-cover"
        />
    </div>
);
