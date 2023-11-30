import React from "react";
import { VoteCollection } from "./VoteCollection";
import { CollectionOfTheMonthWinners } from "@/Components/Collections/CollectionOfTheMonthWinners";

export const CollectionOfTheMonth = (): JSX.Element => (
    <div className="mt-12 flex w-full flex-col gap-4 xl:flex-row">
        <VoteCollection />
        <CollectionOfTheMonthWinners className="hidden xl:flex" />
    </div>
);
