import { type ImageEditActionsProperties, type ImageUploadActionsProperties } from "./GalleryUploadCover.contracts";
import { IconButton } from "@/Components/Buttons";
import { Img } from "@/Components/Image";

export const ImageUploadActions = ({ onUpload }: ImageUploadActionsProperties): JSX.Element => (
    <div
        data-testid="ImageUploadActions"
        className="flex h-full items-center justify-center rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700"
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
        <div className="transition-default absolute inset-0 z-10 flex items-center justify-center rounded-xl opacity-100 group-hover:opacity-100 md:bg-theme-primary-50/75 md:opacity-0 md:backdrop-blur-md md:dark:bg-theme-dark-900/75">
            <div className="flex h-full items-end justify-center pb-4 md:items-center md:pb-0">
                <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md dark:bg-theme-dark-900/30 dark:backdrop-blur-none">
                        <IconButton
                            data-testid="ImageEditActions__upload"
                            icon="Upload"
                            onClick={onUpload}
                            className="border-white outline-offset-4 dark:border-none dark:bg-theme-dark-900 dark:hover:border-theme-primary-400 dark:hover:bg-theme-primary-400 dark:hover:text-white"
                        />
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md dark:bg-theme-dark-900/30 dark:backdrop-blur-none">
                        <IconButton
                            data-testid="ImageEditActions__remove"
                            variant="danger"
                            className="outline-offset-4"
                            icon="Trash"
                            onClick={onRemove}
                        />
                    </div>
                </div>
            </div>
        </div>

        <Img
            src={src}
            wrapperClassName="aspect-[3/2] rounded-xl overflow-hidden"
        />
    </div>
);
