import { router } from "@inertiajs/react";
import React, { useRef } from "react";
import {
    PopularCollectionFloorPrice,
    PopularCollectionName,
    PopularCollectionVolume,
} from "./PopularCollectionsTable.blocks";
import { type PopularCollectionTableItemProperties } from "./PopularCollectionsTable.contract";
import { TableCell, TableRow } from "@/Components/Table";

export const PopularCollectionsTableItem = ({
    collection,
    uniqueKey,
    user,
}: PopularCollectionTableItemProperties): JSX.Element => {
    const reference = useRef(null);

    return (
        <TableRow
            ref={reference}
            key={uniqueKey}
            borderClass=""
            className="group cursor-pointer dark:border-theme-dark-700"
            onClick={() => {
                router.visit(
                    route("collections.view", {
                        slug: collection.slug,
                    }),
                );
            }}
        >
            <TableCell
                variant="start-list"
                innerClassName="py-4"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
                className="unique-cell-until-md-lg"
            >
                <PopularCollectionName collection={collection} />
            </TableCell>

            <TableCell
                className="hidden xl:table-cell"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5 "
                hoverClassName=""
            >
                <PopularCollectionFloorPrice collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md-lg:table-cell"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <PopularCollectionVolume
                    collection={collection}
                    user={user}
                />
            </TableCell>
        </TableRow>
    );
};
