import { createContext, useContext, useState } from "react";

interface Context {
    selected: App.Data.Gallery.GalleryNftData[];
    addToSelection: (nft: App.Data.Gallery.GalleryNftData) => void;
    removeFromSelection: (nft: App.Data.Gallery.GalleryNftData) => void;
    clearSelection: () => void;
}

export const NftSelectionContext = createContext<Context | undefined>(undefined);

export const useNftSelectableContext = (): Context => {
    const context = useContext(NftSelectionContext);

    if (context === undefined) {
        throw new Error("useNftSelectableContext must be within NftSelectionContext.Provider");
    }

    return context;
};

interface NftSelectionProperties {
    children: React.ReactNode;
}

export const NftSelectionHook = ({ children }: NftSelectionProperties): JSX.Element => {
    const [selected, setSelected] = useState<App.Data.Gallery.GalleryNftData[]>([]);

    const addToSelection = (nft: App.Data.Gallery.GalleryNftData): void => {
        for (const selectedNft of selected) {
            if (selectedNft.tokenNumber === nft.tokenNumber) {
                return;
            }
        }

        setSelected([...selected, nft]);
    };

    const removeFromSelection = (nft: App.Data.Gallery.GalleryNftData): void => {
        setSelected(selected.filter((selectedNft) => selectedNft.tokenNumber !== nft.tokenNumber));
    };

    const clearSelection = (): void => {
        setSelected([]);
    };

    return (
        <NftSelectionContext.Provider
            value={{ selected, addToSelection, removeFromSelection, clearSelection }}
            data-testid="NftSelection"
        >
            {children}
        </NftSelectionContext.Provider>
    );
};
