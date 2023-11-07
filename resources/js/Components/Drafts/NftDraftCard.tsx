import { Link } from "@inertiajs/react";
import cn from "classnames";
import { NftDraftHeading, NftDraftImageGrid, NftDraftStats } from "./NftDraftCard.blocks";
import { GalleryCoverImage } from "@/Components/Galleries/GalleryPage/GalleryCoverImage";
import { type GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { isTruthy } from "@/Utils/is-truthy";

export const NftDraftCard = ({ draft, onDelete }: { draft: GalleryDraft; onDelete: () => void }): JSX.Element => {
    let coverImage: string | null = null;

    if (isTruthy(draft.cover) && isTruthy(draft.coverType)) {
        coverImage = URL.createObjectURL(new Blob([draft.cover], { type: draft.coverType }));
    }

    return (
        <Link
            href={"#"}
            className="group focus-visible:outline-none focus-visible:ring-0"
        >
            <div
                className={cn(
                    "transition-default m-1 box-content flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700",
                    "outline outline-3 outline-transparent",
                    "group-hover:outline-theme-primary-100 dark:group-hover:outline-theme-dark-500",
                    "group-focus-visible:outline-theme-primary-300",
                )}
                data-testid="NftDraftCard"
            >
                <div className="px-6 pb-3 pt-6">
                    {coverImage !== null && <GalleryCoverImage image={coverImage} />}

                    {draft.cover === null && <NftDraftImageGrid nfts={draft.nfts} />}

                    <NftDraftHeading
                        title={draft.title}
                        walletAddress={draft.walletAddress}
                    />
                </div>

                <NftDraftStats
                    draft={draft}
                    onDelete={onDelete}
                />
            </div>
        </Link>
    );
};
