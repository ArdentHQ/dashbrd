import cn from "classnames";
import React, { useRef } from "react";
import { NominateCollectionName } from "@/Components/Collections/CollectionName";
import {
    PopularCollectionFloorPrice,
    PopularCollectionVolume,
} from "@/Components/Collections/PopularCollectionsTable/PopularCollectionsTable.blocks";
import { Radio } from "@/Components/Form/Radio";
import { TableCell, TableRow } from "@/Components/Table";
import { type VoteCollectionProperties } from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";

export const NomineeCollection = ({
    collection,
    uniqueKey,
    user,
    selectedCollection,
    setSelectedCollection,
}: {
    collection: VoteCollectionProperties;
    uniqueKey: string;
    user: App.Data.UserData | null;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
}): JSX.Element => {
    const reference = useRef(null);

    return (
        <TableRow
            ref={reference}
            key={uniqueKey}
            className={cn("group cursor-pointer border-b-0 dark:border-theme-dark-700", {
                "selected-candidate": selectedCollection === collection.id,
            })}
            onClick={(): void => {
                setSelectedCollection(collection.id);
            }}
        >
            <TableCell
                variant="start-list"
                paddingClassName="px-0 md:pl-3 md:py-4"
                hoverClassName=""
            >
                <NominateCollectionName collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md:table-cell"
                innerClassName="justify-end"
                hoverClassName=""
            >
                <PopularCollectionFloorPrice collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md:table-cell"
                innerClassName="justify-end"
                hoverClassName=""
            >
                <PopularCollectionVolume
                    collection={collection}
                    user={user}
                />
            </TableCell>

            <TableCell
                className="table-cell"
                innerClassName="justify-end"
                paddingClassName="px-0 md:pr-3 md:pl-4"
                hoverClassName=""
            >
                <Radio
                    name="selected"
                    className=""
                    checked={selectedCollection === collection.id}
                    onChange={(): void => {
                        setSelectedCollection(collection.id);
                    }}
                />
            </TableCell>
        </TableRow>
    );
};
