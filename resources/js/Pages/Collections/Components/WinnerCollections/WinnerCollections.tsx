import { useWinnerCollections } from "./Hooks/useWinnerCollections";
import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsTable,
} from "./WinnerCollections.blocks";

export const WinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionWinnersData[];
}): JSX.Element => {
    const { availableYears, availableMonths, selectedYear, setSelectedYear, filterCollections } = useWinnerCollections({
        collections,
    });

    if (availableYears.length === 0 || availableMonths(selectedYear).length === 0) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter
                availableYears={availableYears}
                selectedYear={selectedYear}
                onChange={setSelectedYear}
            />

            {availableMonths(selectedYear).map((month) => (
                <WinnerCollectionsTable
                    collections={filterCollections({ year: selectedYear, month })[0]}
                    month={month}
                    key={month}
                />
            ))}
        </>
    );
};
