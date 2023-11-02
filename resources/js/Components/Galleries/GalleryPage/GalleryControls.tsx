import { router } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Button, IconButton, LikeButton } from "@/Components/Buttons";
import { Clipboard } from "@/Components/Clipboard";
import { GalleryCurator } from "@/Components/Galleries/GalleryPage/GalleryCurator";
import { GalleryReportModal } from "@/Components/Galleries/GalleryPage/GalleryReportModal";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useLikes } from "@/Hooks/useLikes";

export const GalleryControls = ({
    likesCount,
    wallet,
    gallery,
    alreadyReported = false,
    reportAvailableIn = null,
    isDisabled = false,
    showEditAction = true,
    reportReasons = {},
    showReportModal = false,
}: {
    likesCount?: number;
    gallery?: App.Data.Gallery.GalleryData;
    wallet: App.Data.SimpleWalletData;
    isDisabled?: boolean;
    showEditAction?: boolean;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    showReportModal?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const { signedAction } = useAuthorizedAction();

    const { likes, hasLiked, like } = useLikes({
        count: likesCount ?? 0,
        hasLiked: gallery?.hasLiked ?? false,
    });

    return (
        <div
            data-testid="GalleryControls"
            className="mt-4 flex justify-between"
        >
            <div className="flex">
                <GalleryCurator
                    wallet={wallet}
                    className="mr-3 hidden md:flex"
                />

                {isDisabled || gallery === undefined ? (
                    <IconButton
                        icon="Heart"
                        disabled={isDisabled}
                        data-testid="GalleryControls__like-button"
                    />
                ) : (
                    <>
                        <LikeButton
                            icon="Heart"
                            className={cn(hasLiked && "button-like-selected")}
                            onClick={() => {
                                void signedAction(async ({ authenticated }) => {
                                    // If user wasnt authenticated, force a positive
                                    // like since we dont know if he liked it before
                                    const likeValue = !authenticated ? true : undefined;

                                    await like(gallery.slug, likeValue);

                                    router.reload({
                                        only: ["stats", "gallery"],
                                    });
                                });
                            }}
                            data-testid="GalleryControls__like-button"
                        >
                            {likes}
                        </LikeButton>
                    </>
                )}
            </div>

            <div className="flex space-x-3">
                {isDisabled || gallery === undefined ? (
                    <IconButton
                        icon="Copy"
                        disabled
                        data-testid="GalleryControls__copy-button"
                    />
                ) : (
                    <Clipboard
                        tooltipTitle={t("pages.galleries.copy_gallery_link")}
                        text={route("galleries.view", { slug: gallery.slug })}
                        copiedIconClass="button-icon w-10 h-10"
                    >
                        <IconButton
                            icon="Copy"
                            data-testid="GalleryControls__copy-button"
                        />
                    </Clipboard>
                )}

                {(gallery === undefined || !gallery.isOwner) && (
                    <GalleryReportModal
                        reportReasons={reportReasons}
                        isDisabled={isDisabled}
                        gallery={gallery}
                        alreadyReported={alreadyReported}
                        reportAvailableIn={reportAvailableIn}
                        show={showReportModal}
                    />
                )}

                {gallery?.isOwner === true && showEditAction && (
                    <Tooltip content={t("common.edit")}>
                        <span>
                            <Button
                                data-testid="GalleryControls__edit-button"
                                disabled={isDisabled}
                                icon="Pencil"
                                variant="icon-primary"
                                onClick={() => {
                                    void signedAction(() => {
                                        router.get(route("my-galleries.edit", { slug: gallery.slug }));
                                    });
                                }}
                            />
                        </span>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};
