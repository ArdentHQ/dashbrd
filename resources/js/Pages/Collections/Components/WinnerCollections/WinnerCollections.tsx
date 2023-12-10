import { groupBy } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsList,
} from "./WinnerCollections.blocks";

export const WinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => {
    const collectionsByMonth = groupBy(collections, ({ hasWonAt }) => DateTime.make(hasWonAt).format("MMMM"));
    const monthNames = Object.keys(collectionsByMonth);

    if (monthNames.length === 0) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter />

            {monthNames.map((month) => (
                <WinnerCollectionsList
                    collections={collectionsByMonth[month as keyof typeof collectionsByMonth]}
                    month={month}
                    key={month}
                />
            ))}
        </>
    );
};
