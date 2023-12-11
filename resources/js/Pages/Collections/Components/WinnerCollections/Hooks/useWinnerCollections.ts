import { DateTime } from "@ardenthq/sdk-intl";
import { isTruthy } from "@/Utils/is-truthy";
import { sortByDesc, uniq } from "@ardenthq/sdk-helpers";
import { useState } from "react";

const filterCollections = ({
    year,
    month,
    collections,
}: {
    year: string;
    month?: string;
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}) => {
    return sortByDesc(
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
};

export const useWinnerCollections = ({
    collections,
}: {
    collections: App.Data.Collections.CollectionOfTheMonthData[];
}) => {
    const availableYears = uniq(collections.map(({ hasWonAt }) => DateTime.make(hasWonAt ?? undefined).format("YYYY")));
    const [selectedYear, setSelectedYear] = useState(availableYears[0]);

    const m = filterCollections({ year: selectedYear, collections });
    const availableMonths = uniq(m.map(({ hasWonAt }) => DateTime.make(hasWonAt ?? undefined).format("MMMM")));

    return {
        availableYears,
        availableMonths,
        selectedYear,
        setSelectedYear,
        filterCollections: ({ year, month }: { year: string; month: string }) => {
            return filterCollections({ year, month, collections });
        },
    };
};
