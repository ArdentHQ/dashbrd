import React from "react";
import { VoteCollection } from "./VoteCollection";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";

export const CollectionOfTheMonth = ({
    winners,
}: {
    winners: App.Data.Collections.CollectionOfTheMonthData[];
}): JSX.Element => (
    <div className="mt-12 flex flex-col gap-4 rounded-xl border border-theme-secondary-300 p-8 px-6 dark:border-theme-dark-700 sm:px-8 lg:mx-8  xl:flex-row  xl:border-0 xl:p-0 xl:px-0 2xl:mx-0 ">
        <VoteCollection />

        <CollectionOfTheMonthWinners winners={winners} />
    </div>
);
