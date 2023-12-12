import { sortByDesc, uniq } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { useState } from "react";
import { isTruthy } from "@/Utils/is-truthy";

const filterCollections = ({
    year,
    month,
    collections,
}: {
    year: string;
    month?: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): App.Data.Collections.CollectionOfTheMonthData[] =>
    sortByDesc(
        collections.filter((collection) => {
            if (!isTruthy(collection.hasWonAt)) {
                return false;
            }

            if (DateTime.make(collection.hasWonAt).format("YYYY") !== year) {
                return false;
            }

            if (isTruthy(month)) {
                return DateTime.make(collection.hasWonAt).format("MMMM") === month;
            }

            return true;
        }),
        "votes",
    );

export const useWinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}): {
    availableYears: string[];
    availableMonths: string[];
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    filterCollections: ({
        year,
        month,
    }: {
        year: string;
        month: string;
    }) => App.Data.Collections.CollectionOfTheMonthData[];
} => {
    const availableYears = uniq(collections.map(({ hasWonAt }) => DateTime.make(hasWonAt ?? undefined).format("YYYY")));
    const [selectedYear, setSelectedYear] = useState(availableYears[0]);

    const winners = filterCollections({ year: selectedYear, collections });

    const months = winners.map(({ hasWonAt }) => DateTime.make(hasWonAt ?? undefined).getMonth());
    const availableMonths = sortByDesc(uniq(months))
        .map((month) => DateTime.make().setMonth(month).format("MMMM"))
        .filter((month) => month !== DateTime.make().format("MMMM")); // Exclude this month.

    return {
        availableYears,
        availableMonths,
        selectedYear,
        setSelectedYear,
        filterCollections: ({ year, month }: { year: string; month: string }) =>
            filterCollections({ year, month, collections }),
    };
};
