import { DateTime } from "@ardenthq/sdk-intl";
import React from "react";
import { tp } from "@/Utils/TranslatePlural";

const TIME_PERIODS = ["Years", "Months", "Days", "Hours", "Minutes"] as const;

type PeriodKey = Lowercase<(typeof TIME_PERIODS)[number]> | "few_seconds";

interface DateDifferenceReturnValue {
    count?: number;
    key: PeriodKey;
}

const dateDifference = (date: string): DateDifferenceReturnValue => {
    const now = DateTime.make();
    const target = DateTime.make(date);

    for (const period of TIME_PERIODS) {
        const count: number = now[`diffIn${period}`](target);

        if (count > 0) {
            return { count, key: period.toLowerCase() as PeriodKey };
        }
    }

    return { key: "few_seconds" };
};

export const TimeAgo = ({ date }: { date: string }): JSX.Element => {
    const { count, key } = dateDifference(date);

    return (
        <span data-testid="TimeAgo">
            {tp(`common.datetime.${key.toLowerCase()}_ago`, count ?? 0, { count: count ?? 0 })}
        </span>
    );
};
