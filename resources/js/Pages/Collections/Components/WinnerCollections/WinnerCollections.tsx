import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsTable,
} from "./WinnerCollections.blocks";
import { useWinnerCollections } from "./Hooks/useWinnerCollections";

export const WinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => {
    const { availableYears, availableMonths, selectedYear, setSelectedYear, filterCollections } = useWinnerCollections({
        collections,
    });

    if (availableYears.length === 0 || availableMonths.length === 0) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter
                availableYears={availableYears}
                selectedYear={selectedYear}
                onChange={setSelectedYear}
            />

            {availableMonths.map((month) => (
                <WinnerCollectionsTable
                    collections={filterCollections({ year: selectedYear, month })}
                    month={month}
                    key={month}
                />
            ))}
        </>
    );
};
