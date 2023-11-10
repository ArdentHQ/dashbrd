import { createContext, useContext, useEffect, useState } from "react";
import { type GalleryDraft, useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";

interface ContextProperties {
    drafts?: GalleryDraft[];
    deleteDraft: (draftId: number | null) => Promise<void>;
}

interface ProviderProperties {
    children: React.ReactNode;
}

const DraftGalleriesContext = createContext<ContextProperties | undefined>(undefined);

export const DraftGalleriesContextProvider = ({ children }: ProviderProperties): JSX.Element => {
    const [drafts, setDrafts] = useState<GalleryDraft[]>();

    const { deleteExpiredDrafts, deleteDraft, getDrafts } = useGalleryDrafts(undefined, true);

    const loadWalletDrafts = async (): Promise<void> => {
        const drafts = await getDrafts();

        setDrafts(drafts);
    };

    useEffect(() => {
        void deleteExpiredDrafts();

        void loadWalletDrafts();
    }, []);

    const deleteDraftAndReload = async (draftId: number | null): Promise<void> => {
        if (draftId === null) {
            return;
        }

        await deleteDraft(draftId);

        await loadWalletDrafts();
    };

    return (
        <DraftGalleriesContext.Provider
            value={{
                drafts,
                deleteDraft: deleteDraftAndReload,
            }}
        >
            {children}
        </DraftGalleriesContext.Provider>
    );
};

export const useDraftGalleriesContext = (): ContextProperties => {
    const context = useContext(DraftGalleriesContext);

    if (context === undefined) {
        throw new Error("useDraftGalleriesContext must be used within a DraftGalleriesContextProvider");
    }

    return context;
};