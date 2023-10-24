import { fileOpen } from "browser-fs-access";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageEditActions, ImageUploadActions } from "./GalleryUploadCover.blocks";
import { type GalleryUploadCoverProperties } from "./GalleryUploadCover.contracts";
import { GalleryHeadingPlaceholder, GalleryStatsPlaceholder } from "@/Components/Galleries/NftGalleryCard.blocks";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { Toast } from "@/Components/Toast";
import { useToasts } from "@/Hooks/useToasts";
import { isTruthy } from "@/Utils/is-truthy";

export const GalleryUploadCover = ({
    coverUrl,
    onRemove,
    onSave,
    onCancel,
    maxUploadSize = 2e6, // 2MB
    maxDimensions = {
        width: 287,
        height: 190,
    },
}: GalleryUploadCoverProperties): JSX.Element => {
    const { t } = useTranslation();
    const [imageDataURI, setImageDataURI] = useState<string | undefined>(coverUrl);
    const [blob, setBlob] = useState<File>();
    const { showToast } = useToasts();

    const handleFileOpen = async (): Promise<void> => {
        const file = await fileOpen({ extensions: [".gif", ".jpg", ".png"] });

        if (file.size > maxUploadSize) {
            showToast({
                message: t("common.image_size_error"),
                type: "error",
                isExpanded: true,
            });

            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const image = new Image();
            image.onload = () => {
                if (image.width < maxDimensions.width || image.height < maxDimensions.height) {
                    showToast({
                        message: t("common.image_dimensions_error"),
                        type: "error",
                        isExpanded: true,
                    });

                    return;
                }

                setImageDataURI(event.target?.result?.toString());

                setBlob(file);
            };

            const dataUrl: string | undefined = event.target?.result?.toString();
            if (dataUrl !== undefined) {
                image.src = dataUrl;
            }
        });

        reader.readAsDataURL(file);
    };

    return (
        <div data-testid="GalleryUploadCover">
            <div className="space-y-6 overflow-auto">
                <p className="text-theme-secondary-700 dark:text-theme-dark-200">
                    {t("pages.galleries.create.gallery_cover_description")}
                </p>

                <div className="mb-12 overflow-auto">
                    <div className="sm:mx-[55px]">
                        <div className="transition-default m-1 box-content flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700">
                            <div className="rounded-xl px-6 pb-3 pt-6">
                                <div className="relative mb-3 aspect-[3/2]">
                                    {!isTruthy(imageDataURI) && (
                                        <ImageUploadActions
                                            onUpload={() => {
                                                void handleFileOpen();
                                            }}
                                        />
                                    )}

                                    {isTruthy(imageDataURI) && (
                                        <ImageEditActions
                                            src={imageDataURI}
                                            onUpload={() => {
                                                void handleFileOpen();
                                            }}
                                            onRemove={() => {
                                                setImageDataURI(undefined);
                                                onRemove?.();
                                            }}
                                        />
                                    )}
                                </div>

                                <GalleryHeadingPlaceholder />
                            </div>

                            <GalleryStatsPlaceholder />
                        </div>
                    </div>
                </div>

                <Toast
                    type="info"
                    isExpanded
                    isStatic
                    message={t("pages.galleries.create.gallery_cover_information")}
                />
            </div>

            <SliderFormActionsToolbar
                isSaveEnabled={imageDataURI !== coverUrl}
                onSave={() => {
                    onSave?.({ blob, imageDataURI });
                }}
                onCancel={onCancel}
            />
        </div>
    );
};
