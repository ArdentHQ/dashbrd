import React from "react";
import { VoteCollection } from "./VoteCollection";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";

export const CollectionOfTheMonth = ({
    winners,
}: {
    // Depending on how we get the data the type may change
    winners: App.Data.Collections.PopularCollectionData[];
}): JSX.Element => (
    <div className="mt-12 flex w-full flex-col gap-4 px-6 sm:px-8 xl:flex-row xl:px-0">
        <VoteCollection />

        <CollectionOfTheMonthWinners
            className="hidden xl:flex"
            winners={winners}
        />
    </div>
);
