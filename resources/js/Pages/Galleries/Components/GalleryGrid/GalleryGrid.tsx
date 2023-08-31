import { NftGalleryCard } from "@/Components/Galleries";

export const GalleryGrid = ({ galleries }: { galleries: App.Data.Gallery.GalleryData[] }): JSX.Element => (
    <div className="-m-1 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {galleries.map((gallery, key) => (
            <NftGalleryCard
                gallery={gallery}
                key={key}
            />
        ))}
    </div>
);
