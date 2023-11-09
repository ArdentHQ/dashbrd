import { Link } from "@inertiajs/react";
import cn from "classnames";
import { NftGalleryDraftHeading, NftGalleryDraftImageGrid, NftGalleryDraftStats } from "./NftGalleryDraftCard.blocks";
import { GalleryCoverImage } from "@/Components/Galleries/GalleryPage/GalleryCoverImage";
import { type GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { isTruthy } from "@/Utils/is-truthy";

export const NftGalleryDraftCard = ({
    draft,
    onDelete,
}: {
    draft: GalleryDraft;
    onDelete: () => void;
}): JSX.Element => {
    let coverImage: string | null = null;

    if (isTruthy(draft.cover) && isTruthy(draft.coverType)) {
        coverImage = URL.createObjectURL(new Blob([draft.cover], { type: draft.coverType }));
    }

    return (
        <Link
            href={route("my-galleries.create", {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                draft: draft.id!,
            })}
            className="group focus-visible:outline-none focus-visible:ring-0"
        >
            <div
                className={cn(
                    "transition-default m-1 box-content flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700",
                    "outline outline-3 outline-transparent",
                    "group-hover:outline-theme-primary-100 dark:group-hover:outline-theme-dark-500",
                    "group-focus-visible:outline-theme-primary-300",
                )}
                data-testid="NftGalleryDraftCard"
            >
                <div className="px-6 pb-3 pt-6">
                    {coverImage !== null && <GalleryCoverImage image={coverImage} />}

                    {draft.cover === null && <NftGalleryDraftImageGrid nfts={draft.nfts} />}

                    <NftGalleryDraftHeading
                        title={draft.title}
                        walletAddress={draft.walletAddress}
                    />
                </div>

                <NftGalleryDraftStats
                    draft={draft}
                    onDelete={onDelete}
                />
            </div>
        </Link>
    );
};
