import { CollectionHeaderBottom, CollectionHeaderTop } from "@/Components/Collections/CollectionHeader";

interface Properties {
    collection: App.Data.Collections.CollectionDetailData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons: Record<string, string>;
}

export const CollectionHeading = ({
    collection,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons,
}: Properties): JSX.Element => (
    <div className="-mx-6 -mt-6 flex flex-col overflow-hidden border-theme-secondary-300 sm:-mx-8 sm:-mt-8 lg:mx-0 lg:mt-0 lg:rounded-xl lg:border">
        <div className="collection-banner flex h-21 items-center bg-theme-secondary-50 bg-cover bg-center sm:h-30 md:h-50">
            {collection.banner !== null && (
                <img
                    src={collection.banner}
                    className="h-full w-full object-cover"
                />
            )}
        </div>

        <CollectionHeaderTop
            reportReasons={reportReasons}
            className="-mt-16 px-6 pb-4 lg:-mt-12 lg:pb-6"
            collection={collection}
            alreadyReported={alreadyReported}
            reportAvailableIn={reportAvailableIn}
        />

        <CollectionHeaderBottom collection={collection} />
    </div>
);
