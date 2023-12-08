import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsList,
} from "./WinnerCollections.blocks";

export const WinnerCollections = () => {
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
