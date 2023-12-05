import React from "react";
import { VoteCollection } from "./VoteCollection";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";

export const CollectionOfTheMonth = ({
    winners,
    collections,
    user,
}: {
    winners: App.Data.Collections.CollectionOfTheMonthData[];
    collections: App.Data.Collections.PopularCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => (
    <div className="mt-12 flex w-full flex-col gap-4 px-6 sm:px-8 xl:flex-row xl:px-0">
        <VoteCollection
            collections={collections}
            user={user}
        />

        <CollectionOfTheMonthWinners
            className="hidden xl:flex"
            winners={winners}
        />
    </div>
);
