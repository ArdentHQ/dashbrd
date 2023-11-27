import React from "react";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";
import cn from "classnames";
import { twMerge } from "tailwind-merge";

export const FeaturedCollectionNfts = ({ nfts }: { nfts: App.Data.Gallery.GalleryNftData[] }): JSX.Element => {
    const defaultClassName = "w-72 md:w-56 bg-white dark:bg-theme-dark-900 md-lg:w-52";

    return (
        <div className="flex justify-center space-x-3">
            <CollectionNft
                nft={nfts[0]}
                className={defaultClassName}
            />

            {nfts.length > 1 && (
                <CollectionNft
                    nft={nfts[1]}
                    className={twMerge(defaultClassName, "hidden sm:block")}
                />
            )}

            {nfts.length > 2 && (
                <CollectionNft
                    nft={nfts[2]}
                    className={twMerge(defaultClassName, "hidden md:block md-lg:hidden xl:block")}
                />
            )}
        </div>
    );
};
