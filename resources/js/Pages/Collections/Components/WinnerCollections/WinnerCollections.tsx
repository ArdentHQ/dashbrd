import { groupBy } from "@ardenthq/sdk-helpers";
import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsList,
} from "./WinnerCollections.blocks";
import { DateTime } from "@ardenthq/sdk-intl";

export const WinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => {
    const collectionsByMonth = groupBy(collections, ({ winningMonth }) => DateTime.make(winningMonth).format("MMMM"));
    const monthNames = Object.keys(collectionsByMonth);

    if (monthNames.length === 0) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter />

            {monthNames.map((month) => (
                <WinnerCollectionsList
                    collections={month as keyof typeof collectionsByMonth}
                    month={month}
                    key={month}
                />
            ))}
        </>
    );
};
