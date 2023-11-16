import { createContext, useContext, useEffect, useState } from "react";

interface ContextNfts {
    selected: App.Data.Gallery.GalleryNftData[];
    add: (...nfts: App.Data.Gallery.GalleryNftData[]) => void;
    remove: (nft: App.Data.Gallery.GalleryNftData) => void;
    update: (list: App.Data.Gallery.GalleryNftData[]) => void;
}

interface Context {
    nfts: ContextNfts;
    nftLimit: number;
}

interface EditableGalleryProperties {
    children: React.ReactNode;
    selectedNfts?: App.Data.Gallery.GalleryNftData[];
    nftLimit: number;
}

export const GalleryContext = createContext<Context | undefined>(undefined);

export const useEditableGalleryContext = (): Context => {
    const context = useContext(GalleryContext);

    if (context === undefined) {
        throw new Error("useEditableGalleryContext must be within GalleryContext.Provider");
    }

    return context;
};

export const hasEditableContext = (): boolean => useContext(GalleryContext) !== undefined;

const getSelectedNftsHook = ({
    selectedNfts,
    nftLimit,
}: {
    selectedNfts?: App.Data.Gallery.GalleryNftData[];
    nftLimit: number;
}): ContextNfts => {
    const [selected, setSelected] = useState<App.Data.Gallery.GalleryNftData[]>(selectedNfts ?? []);
    useEffect(() => {
        setSelected(selectedNfts ?? []);
    }, [selectedNfts]);

    const add = (...nfts: App.Data.Gallery.GalleryNftData[]): void => {
        if (selected.length === nftLimit) {
            return;
        }

        const nftsToAdd: App.Data.Gallery.GalleryNftData[] = [];

        for (const nft of nfts) {
            let alreadySet = false;

            for (const selectedNft of selected) {
                if (selectedNft.tokenNumber === nft.tokenNumber) {
                    alreadySet = true;

                    break;
                }
            }

            if (!alreadySet) {
                nftsToAdd.push(nft);
            }

            if (selected.length + nftsToAdd.length === nftLimit) {
                break;
            }
        }

        setSelected([...selected, ...nftsToAdd]);
    };

    const remove = (nft: App.Data.Gallery.GalleryNftData): void => {
        setSelected(selected.filter((selectedNft) => selectedNft.tokenNumber !== nft.tokenNumber));
    };

    const update = (newList: App.Data.Gallery.GalleryNftData[]): void => {
        setSelected(newList);
    };

    return {
        selected,
        add,
        remove,
        update,
    };
};

export const EditableGalleryHook = ({ children, selectedNfts, nftLimit }: EditableGalleryProperties): JSX.Element => (
    <GalleryContext.Provider
        value={{
            nfts: getSelectedNftsHook({ selectedNfts, nftLimit }),
            nftLimit,
        }}
        data-testid="EditableGallery"
    >
        {children}
    </GalleryContext.Provider>
);
