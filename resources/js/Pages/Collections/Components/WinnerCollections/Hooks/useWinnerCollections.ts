import { sortByDesc, uniq } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { useState } from "react";

const filterCollections = ({
    year,
    month,
    collections,
}: {
    year: number;
    month?: number;
    collections: App.Data.Collections.CollectionWinnersData[];
}): App.Data.Collections.CollectionWinnersData[] =>
    collections.filter((winner) => winner.year === year && (month === undefined || winner.month === month));

export const useWinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionWinnersData[];
}): {
    availableYears: number[];
    availableMonths: (year: number) => number[];
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    filterCollections: ({
        year,
        month,
    }: {
        year: number;
        month: number;
    }) => App.Data.Collections.CollectionWinnersData[];
} => {
    const availableYears = sortByDesc(uniq(collections.map((winner) => winner.year)));
    const [selectedYear, setSelectedYear] = useState(availableYears[0]);

    const winners = filterCollections({ year: selectedYear, collections });

    const availableMonths = (year: number): number[] => {
        const months = winners.filter((winner) => winner.year === year).map((winner) => winner.month);

        return sortByDesc(uniq(months)).filter((month) => {
            if (year !== DateTime.make().getYear()) {
                return true;
            }

            // Exclude this month.
            return month !== DateTime.make().getMonth();
        });
    };

    return {
        availableYears,
        availableMonths,
        selectedYear,
        setSelectedYear,
        filterCollections: ({ year, month }: { year: number; month: number }) =>
            filterCollections({ year, month, collections }),
    };
};
