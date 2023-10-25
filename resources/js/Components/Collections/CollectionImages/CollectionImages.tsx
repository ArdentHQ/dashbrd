import { Img } from "@/Components/Image";

export const CollectionImages = ({
    nfts,
    nftsCount,
    maxItems = 4,
}: {
    nfts: App.Data.Collections.SimpleNftData[];
    nftsCount: number;
    maxItems?: number;
}): JSX.Element => (
    <div
        data-testid="CollectionImages"
        className="flex items-center space-x-2"
    >
        {nfts.slice(0, maxItems - 1).map((nft) => (
            <div
                className="h-20 w-20"
                key={nft.id}
            >
                <Img
                    className="block aspect-square h-full w-full grow rounded-lg object-cover"
                    src={nft.images.small ?? undefined}
                    data-testid={`CollectionImages__image--${nft.tokenNumber}`}
                />
            </div>
        ))}

        {nftsCount >= maxItems && (
            <div className="relative h-20 w-20 overflow-hidden rounded-lg backdrop-blur-0">
                {nftsCount > maxItems && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-md dark:bg-theme-dark-900/75">
                        <span className="text-base font-medium dark:text-theme-dark-50">
                            {maxItems > 1 && "+"}
                            {nftsCount - maxItems + 1}
                        </span>
                    </div>
                )}
                <Img
                    className="aspect-square h-full w-full object-cover"
                    src={nfts[maxItems - 1].images.small ?? undefined}
                    data-testid={`CollectionImages__image--${nfts[maxItems - 1].tokenNumber}`}
                />
            </div>
        )}
    </div>
);
