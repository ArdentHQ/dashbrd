import { router } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { IconButton, LikeButton } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Clipboard } from "@/Components/Clipboard";
import { GalleryCurator } from "@/Components/Galleries/GalleryPage/GalleryCurator";
import { GalleryReportModal } from "@/Components/Galleries/GalleryPage/GalleryReportModal";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";
import { useLikes, type UseLikesReturnType } from "@/Hooks/useLikes";

export const GalleryControls = ({
    likesCount,
    wallet,
    gallery,
    alreadyReported = false,
    reportAvailableIn = null,
    isDisabled = false,
    showEditAction = true,
    reportReasons = {},
}: {
    likesCount?: number;
    gallery?: App.Data.Gallery.GalleryData;
    wallet: App.Data.Gallery.GalleryWalletData;
    isDisabled?: boolean;
    showEditAction?: boolean;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}): JSX.Element => {
    const { t } = useTranslation();

    const { authenticated } = useAuth();

    const { showConnectOverlay } = useMetaMaskContext();

    let { likes, hasLiked, like }: Partial<UseLikesReturnType> = {
        likes: 0,
        hasLiked: false,
        like: undefined,
    };

    if (likesCount !== undefined && gallery !== undefined) {
        const result = useLikes({ count: likesCount, hasLiked: gallery.hasLiked });

        likes = result.likes;
        hasLiked = result.hasLiked;
        like = result.like;
    }

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
                                if (!authenticated) {
                                    showConnectOverlay(() => {
                                        void like(gallery.slug, true);

                                        router.reload({
                                            only: ["stats", "gallery"],
                                        });
                                    });

                                    return;
                                }

                                void like(gallery.slug);
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
                    />
                )}

                {gallery?.isOwner === true && showEditAction && (
                    <ButtonLink
                        data-testid="GalleryControls__edit-button"
                        disabled={isDisabled}
                        icon="Pencil"
                        variant="icon-primary"
                        href={route("my-galleries.edit", { slug: gallery.slug })}
                    />
                )}
            </div>
        </div>
    );
};
