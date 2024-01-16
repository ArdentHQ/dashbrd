import cn from "classnames";
import React, { useMemo, useRef } from "react";
import { Trans } from "react-i18next";
import { NominateCollectionName } from "@/Components/Collections/CollectionName";
import {
    PopularCollectionFloorPrice,
    PopularCollectionVolume,
} from "@/Components/Collections/PopularCollectionsTable/PopularCollectionsTable.blocks";
import { Radio } from "@/Components/Form/Radio";
import { TableCell, TableRow } from "@/Components/Table";
import { Tooltip } from "@/Components/Tooltip";

export const NomineeCollection = ({
    collection,
    uniqueKey,
    user,
    selectedCollection,
    setSelectedCollection,
}: {
    collection: App.Data.Collections.VotableCollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
}): JSX.Element => {
    const reference = useRef(null);

    const isDisabled = useMemo(() => collection.alreadyWon, [collection]);

    const selectHandler = isDisabled
        ? undefined
        : (): void => {
              setSelectedCollection(collection.id);
          };

    return (
        <Tooltip
            content={<Trans i18nKey="pages.collections.collection_of_the_month.has_won_already" />}
            disabled={!isDisabled}
        >
            <TableRow
                ref={reference}
                key={uniqueKey}
                className={cn("group border-b-0 dark:border-theme-dark-700", {
                    "selected-candidate": selectedCollection === collection.id,
                    "disabled-row bg-theme-secondary-50 dark:bg-theme-dark-800": isDisabled,
                })}
                onClick={selectHandler}
            >
                <TableCell
                    variant="start-list"
                    paddingClassName="px-0 md:pl-3 md:py-4"
                    hoverClassName=""
                >
                    <NominateCollectionName
                        collection={collection}
                        isDisabled={isDisabled}
                    />
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
                        disabled={isDisabled}
                        checked={selectedCollection === collection.id}
                        onChange={selectHandler}
                    />
                </TableCell>
            </TableRow>
        </Tooltip>
    );
};
