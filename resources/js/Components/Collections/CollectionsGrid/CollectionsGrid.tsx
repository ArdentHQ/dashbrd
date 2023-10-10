import { BigNumber, sortByDesc } from "@ardenthq/sdk-helpers";
import { CollectionCard } from "@/Components/Collections/CollectionCard";
import { CollectionCardSkeleton } from "@/Components/Collections/CollectionCard/CollectionCardSkeleton";

const skeletonsCount = 10;

export const CollectionsGrid = ({
    collections,
    nfts,
    hiddenCollectionAddresses,
    reportByCollectionAvailableIn,
    alreadyReportedByCollection,
    reportReasons,
    isLoading = false,
    onLoadMore,
    onChanged,
    onReportCollection,
}: {
    collections: App.Data.Collections.CollectionData[];
    nfts: App.Data.Collections.CollectionNftData[];
    hiddenCollectionAddresses: string[];
    reportByCollectionAvailableIn: Record<string, string | null>;
    alreadyReportedByCollection: Record<string, boolean>;
    reportReasons?: Record<string, string>;
    isLoading?: boolean;
    onLoadMore?: () => void;
    onChanged: () => void;
    onReportCollection?: (address: string) => void;
}): JSX.Element => {
    if (isLoading) {
        return (
            <div
                data-testid="CollectionsGridSkeleton"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4"
            >
                {Array.from({ length: skeletonsCount })
                    .fill({})
                    .map((_, key) => (
                        <CollectionCardSkeleton key={key} />
                    ))}
            </div>
        );
    }

    return (
        <div
            data-testid="CollectionsGrid"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4"
        >
            {collections.map((collection, index) => (
                <CollectionCard
                    isHidden={hiddenCollectionAddresses.includes(collection.address)}
                    collection={collection}
                    nfts={nfts}
                    key={`${collection.address}-${collection.chainId}`}
                    reportAvailableIn={reportByCollectionAvailableIn[collection.address]}
                    alreadyReported={alreadyReportedByCollection[collection.address]}
                    reportReasons={reportReasons}
                    onVisible={() => {
                        const isViewingLastItems = collections.length - index < 10;

                        if (!isViewingLastItems) {
                            return;
                        }

                        onLoadMore?.();
                    }}
                    onChanged={onChanged}
                    onReportCollection={onReportCollection}
                />
            ))}
        </div>
    );
};
