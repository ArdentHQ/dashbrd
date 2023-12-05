import React, { useRef } from "react";
import { NominateCollectionName } from "@/Components/Collections/CollectionName";
import {
    PopularCollectionFloorPrice,
    PopularCollectionVolume,
} from "@/Components/Collections/PopularCollectionsTable/PopularCollectionsTable.blocks";
import { Radio } from "@/Components/Form/Radio";
import { TableCell, TableRow } from "@/Components/Table";

export const CollectionOfTheMonthTableItem = ({
    collection,
    uniqueKey,
    user,
}: {
    collection: App.Data.Collections.PopularCollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
}): JSX.Element => {
    const reference = useRef(null);

    return (
        <TableRow
            ref={reference}
            key={uniqueKey}
            className="group cursor-pointer dark:border-theme-dark-700"
            onClick={() => {
                console.log("TODO: implement");
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
                    onChange={(event) => {
                        console.log(event);
                    }}
                />
            </TableCell>
        </TableRow>
    );
};
