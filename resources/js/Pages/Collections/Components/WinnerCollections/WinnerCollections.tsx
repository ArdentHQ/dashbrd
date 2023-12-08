import {
    WinnerCollectionsEmptyBlock,
    WinnerCollectionsFilter,
    WinnerCollectionsList,
} from "./WinnerCollections.blocks";

export const WinnerCollections = ({ months = [] }: { months: string[] }): JSX.Element => {
    if (months.length === 0) {
        return <WinnerCollectionsEmptyBlock />;
    }

    return (
        <>
            <WinnerCollectionsFilter />

            {months.map((month) => (
                <WinnerCollectionsList
                    month={month}
                    key={month}
                />
            ))}
        </>
    );
};
