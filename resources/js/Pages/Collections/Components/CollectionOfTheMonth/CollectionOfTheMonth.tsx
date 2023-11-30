import React from "react";
import { VoteCollections } from "./VoteCollections";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";

export const CollectionOfTheMonth = (): JSX.Element => (
    <div className="mt-12 flex w-full flex-col gap-4 xl:flex-row">
        <VoteCollections />
        <CollectionOfTheMonthWinners className="hidden xl:flex" />
    </div>
);
