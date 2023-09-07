import { GalleryNftsNft } from "./GalleryNftsNft";

export const GalleryNfts = ({ nfts }: { nfts: App.Data.Gallery.GalleryNftData[] }): JSX.Element => (
    <ul
        data-testid="GalleryNfts"
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4"
    >
        {nfts.map((nft) => (
            <li
                data-testid="GalleryNfts__nft"
                key={nft.tokenNumber}
            >
                <GalleryNftsNft nft={nft} />
            </li>
        ))}
    </ul>
);
