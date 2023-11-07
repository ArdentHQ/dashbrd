import { useState } from "react";
import { GalleryNftsNft } from "./GalleryNftsNft";

export const GalleryNfts = ({ nfts }: { nfts: App.Data.Gallery.GalleryNftData[] }): JSX.Element => {
    const [selectedNft, setSelectedNft] = useState<string | undefined>();

    return (
        <ul
            data-testid="GalleryNfts"
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 md-lg:grid-cols-3"
        >
            {nfts.map((nft) => (
                <li
                    data-testid="GalleryNfts__nft"
                    key={nft.tokenNumber}
                >
                    <GalleryNftsNft
                        nft={nft}
                        isSelected={selectedNft !== undefined && selectedNft === `${nft.tokenNumber}_${nft.id}`}
                        onClick={setSelectedNft}
                    />
                </li>
            ))}
        </ul>
    );
};
