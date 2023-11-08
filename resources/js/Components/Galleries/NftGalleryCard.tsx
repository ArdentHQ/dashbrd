import { Link } from "@inertiajs/react";
import cn from "classnames";
import { GalleryCoverImage } from "@/Components/Galleries/GalleryPage/GalleryCoverImage";
import { GalleryHeading, GalleryStats, NftImageGrid } from "@/Components/Galleries/NftGalleryCard.blocks";

export const NftGalleryCard = ({
    gallery,
    showDeleteButton = false,
}: {
    gallery: App.Data.Gallery.GalleryData;
    showDeleteButton?: boolean;
}): JSX.Element => (
    <div className="group focus-visible:outline-none focus-visible:ring-0">
        <div
            className={cn(
                "transition-default m-1 box-content flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700",
                "outline outline-3 outline-transparent",
                "group-hover:outline-theme-primary-100 dark:group-hover:outline-theme-dark-500",
                "group-focus-visible:outline-theme-primary-300",
            )}
            data-testid="NftGalleryCard"
        >
            <div className="px-6 pb-3 pt-6">
                {gallery.coverImage !== null && <GalleryCoverImage image={gallery.coverImage} />}

                {gallery.coverImage === null && <NftImageGrid nfts={gallery.nfts} />}

                <Link href={route("galleries.view", gallery.slug)}>
                    <GalleryHeading
                        name={gallery.name}
                        wallet={gallery.wallet}
                    />
                </Link>
            </div>

            <GalleryStats
                showDeleteButton={showDeleteButton}
                gallery={gallery}
            />
        </div>
    </div>
);
