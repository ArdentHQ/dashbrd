import cn from "classnames";
import React from "react";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";

export const FeaturedCollectionNfts = ({ nfts }: { nfts: App.Data.Gallery.GalleryNftData[] }): JSX.Element => {
    const defaultClassName = "w-72 bg-white dark:bg-theme-dark-900 md-lg:w-52";

    return (
        <div className="flex justify-center space-x-3">
            <CollectionNft
                nft={nfts[0]}
                className={defaultClassName}
            />

            {nfts.length > 1 && (
                <CollectionNft
                    nft={nfts[1]}
                    className={cn(defaultClassName, "hidden sm:block")}
                />
            )}

            {nfts.length > 2 && (
                <CollectionNft
                    nft={nfts[2]}
                    className={cn(defaultClassName, "hidden xl:block")}
                />
            )}
        </div>
    );
};
