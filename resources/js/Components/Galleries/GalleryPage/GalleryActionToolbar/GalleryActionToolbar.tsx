import { type FormEvent, type MouseEvent, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton } from "@/Components/Buttons";
import { Img } from "@/Components/Image";
import { isTruthy } from "@/Utils/is-truthy";

export const GalleryActionToolbar = ({
    galleryCoverUrl,
    onCoverClick,
    onTemplateClick,
    onDelete,
    onPublish,
    onCancel,
    isProcessing = false,
    showDelete = true,
}: {
    onCoverClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onTemplateClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onDelete?: (event: MouseEvent<HTMLButtonElement>) => void;
    onPublish?: (event: FormEvent) => void;
    onCancel?: () => void;
    galleryCoverUrl?: string;
    isProcessing?: boolean;
    showDelete?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();
    const [scrollbarWidth, setScrollbarWidth] = useState(0);

    const updateScrollbarWidth = (): void => {
        setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth);
    };

    useLayoutEffect(() => {
        updateScrollbarWidth();

        window.addEventListener("resize", updateScrollbarWidth);

        return (): void => {
            window.addEventListener("resize", updateScrollbarWidth);
        };
    }, []);

    return (
        <div
            data-testid="GalleryActionToolbar"
            className="fixed inset-x-0 bottom-0 z-10 border-t border-theme-secondary-300 bg-white"
        >
            <div
                className="relative h-20"
                style={{
                    width: `calc(100vw - ${scrollbarWidth}px)`,
                }}
            >
                <div className="absolute left-[50%] w-full max-w-content translate-x-[-50%]">
                    <div className="w-full py-4">
                        <div className="mx-6 sm:mx-8 2xl:mx-0">
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-3 lg:hidden">
                                    <IconButton
                                        icon="Cog"
                                        onClick={onTemplateClick}
                                        className="lg:hidden"
                                        data-testid="GalleryActionToolbar__template-button-mobile"
                                    />

                                    <Button
                                        icon="GridWithPencil"
                                        iconPosition="right"
                                        variant="secondary"
                                        type="button"
                                        iconClass="text-theme-hint-900"
                                        className="hidden h-full rounded-none rounded-r-xl border-none bg-transparent px-5 font-normal lg:block"
                                        onClick={onTemplateClick}
                                        data-testid="GalleryActionToolbar__template-button"
                                    >
                                        <span className="text-theme-secondary-700">{t("common.basic_gallery")}</span>
                                    </Button>

                                    {showDelete && (
                                        <IconButton
                                            data-testid="GalleryActionToolbar__delete"
                                            icon="Trash"
                                            onClick={onDelete}
                                        />
                                    )}
                                </div>

                                <div className="flex space-x-3 sm:hidden">
                                    <IconButton
                                        icon="DoorExit"
                                        className="rotate-180"
                                        onClick={onCancel}
                                    />
                                    <IconButton
                                        icon="CheckSmall"
                                        variant="primary"
                                        onClick={onPublish}
                                    />
                                </div>

                                <div className="hidden w-auto flex-nowrap space-x-3 lg:flex">
                                    <div className="flex items-center rounded-xl border border-theme-secondary-400 text-theme-secondary-700">
                                        <span className="rounded-l-xl border-r border-theme-secondary-400 bg-theme-secondary-50 px-4 py-3">
                                            {t("common.template")}
                                        </span>

                                        <IconButton
                                            icon="Cog"
                                            onClick={onTemplateClick}
                                            className="lg:hidden"
                                            data-testid="GalleryActionToolbar__template-button-mobile"
                                        />

                                        <Button
                                            icon="GridWithPencil"
                                            iconPosition="right"
                                            variant="secondary"
                                            type="button"
                                            iconClass="text-theme-hint-900"
                                            className="hidden h-full rounded-none rounded-r-xl border-none bg-transparent px-5 font-normal lg:block"
                                            onClick={onTemplateClick}
                                            data-testid="GalleryActionToolbar__template-button"
                                        >
                                            <span className="text-theme-secondary-700">
                                                {t("common.basic_gallery")}
                                            </span>
                                        </Button>
                                    </div>

                                    <div className="flex items-center rounded-xl border border-theme-secondary-400 text-theme-secondary-700">
                                        <div className="rounded-l-xl border-r border-theme-secondary-400 bg-theme-secondary-50 px-4 py-3">
                                            {t("common.cover")}
                                        </div>

                                        {!isTruthy(galleryCoverUrl) && (
                                            <IconButton
                                                onClick={onCoverClick}
                                                icon="RoundedSquareWithPencil"
                                                className="h-full rounded-none rounded-r-xl border-none bg-transparent font-normal text-theme-hint-900"
                                            />
                                        )}

                                        {isTruthy(galleryCoverUrl) && (
                                            <Button
                                                onClick={onCoverClick}
                                                variant="bordered"
                                                className="flex h-full rounded-none rounded-r-xl border-none bg-transparent font-normal text-theme-hint-900"
                                                icon="RoundedSquareWithPencil"
                                                iconPosition="right"
                                            >
                                                <Img
                                                    src={galleryCoverUrl}
                                                    className="mr-2 aspect-[3/2] w-12 rounded-md object-cover"
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden space-x-3 sm:flex">
                                    {showDelete && (
                                        <IconButton
                                            data-testid="GalleryActionToolbar__delete"
                                            icon="Trash"
                                            className="flex sm:hidden lg:flex"
                                            onClick={onDelete}
                                        />
                                    )}

                                    <Button
                                        variant="secondary"
                                        onClick={onCancel}
                                    >
                                        {t("common.cancel")}
                                    </Button>
                                    <Button
                                        data-testid="GalleryActionToolbar__publish"
                                        disabled={isProcessing}
                                        variant="secondary"
                                        onClick={onPublish}
                                        icon={isProcessing ? "Spinner" : undefined}
                                        iconClass="animate-spin"
                                        iconPosition="right"
                                    >
                                        {t("common.publish")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
