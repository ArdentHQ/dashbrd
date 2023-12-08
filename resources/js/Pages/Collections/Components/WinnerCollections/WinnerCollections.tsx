import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsList,
} from "./WinnerCollections.blocks";

export const WinnerCollections = () => {
    // TODO: handle with real data.
    if (false) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter />
            <WinnerCollectionsList month="November" />
            <WinnerCollectionsList month="October" />
            <WinnerCollectionsList month="September" />
        </>
    );
};
