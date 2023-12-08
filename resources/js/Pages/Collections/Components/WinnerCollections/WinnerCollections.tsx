import { WinnerCollectionsEmptyBlock, WinnerCollectionsList } from "./WinnerCollections.blocks";

export const WinnerCollections = () => {
    if (false) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsList month="November" />
            <WinnerCollectionsList month="October" />
            <WinnerCollectionsList month="September" />
        </>
    );
};
