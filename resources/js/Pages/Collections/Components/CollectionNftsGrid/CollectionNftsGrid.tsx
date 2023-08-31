import { Pagination } from "@/Components/Pagination";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";

export const CollectionNftsGrid = ({
    nfts,
    userNfts,
}: {
    nfts: App.Data.Gallery.GalleryNftsData;
    userNfts: App.Data.Collections.CollectionNftsData;
}): JSX.Element => (
    <div className="flex flex-col items-center space-y-6 ">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md-lg:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {nfts.paginated.data.map((nft) => (
                <CollectionNft
                    key={nft.id}
                    nft={nft}
                    owned={userNfts.paginated.some((userNft) => userNft.id === nft.id)}
                />
            ))}
        </div>

        <Pagination data={nfts.paginated} />
    </div>
);
