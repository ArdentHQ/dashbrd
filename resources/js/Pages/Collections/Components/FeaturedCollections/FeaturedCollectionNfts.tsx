import cn from "classnames";
import React from "react";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";

export const FeaturedCollectionNfts = ({ nfts }: { nfts: App.Data.Gallery.GalleryNftData[] }): JSX.Element => {
    const defaultNftCardStyles =
        "bg-white dark:bg-theme-dark-900 grid w-full h-full min-w-full lg:min-w-fit lg:w-52 lg:h-fit";

    return (
        <div className="grid w-full grid-flow-col items-center gap-3 lg:w-fit">
            <CollectionNft
                nft={nfts[0]}
                classNames={cn(defaultNftCardStyles, "grid")}
            />
            {nfts.length > 1 && (
                <CollectionNft
                    nft={nfts[1]}
                    classNames={cn(defaultNftCardStyles, "sm:grid hidden")}
                />
            )}
            {nfts.length > 2 && (
                <CollectionNft
                    nft={nfts[2]}
                    classNames={cn(defaultNftCardStyles, "md:grid md-lg:hidden hidden xl:grid")}
                />
            )}
        </div>
    );
};
