import { useCallback, useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";
import { isTruthy } from "@/Utils/is-truthy";

const MAX_DRAFT_LIMIT_PER_WALLET = 6;
const DRAFT_TTL_DAYS = 30;

interface Properties {
    address: string;
    limit?: number;
}

export interface DraftNft {
    nftId: number;
    image: string;
    collectionSlug: string;
}

export interface GalleryDraft {
    title: string;
    cover: ArrayBuffer | null;
    coverType: string | null;
    nfts: DraftNft[];
    walletAddress?: string;
    id?: number | null;
    value: string | null;
    collectionsCount: number;
    updatedAt: number | null;
}

interface WalletDraftGalleriesState {
    upsert: (draft: GalleryDraft) => Promise<GalleryDraft>;
    remove: (id?: number | null) => Promise<void>;
    removeExpired: () => Promise<void>;
    drafts: GalleryDraft[];
    findById: (id: number | string) => void;
    isLoading: boolean;
    isSaving: boolean;
    hasReachedLimit: boolean;
}

export const useWalletDraftGalleries = ({ address }: Properties): WalletDraftGalleriesState => {
    const database = useIndexedDB("gallery-drafts");
    const [drafts, setDrafts] = useState<GalleryDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);

    const updateDraftState = useCallback(async () => {
        setIsLoading(true);

        const drafts = await allDrafts();

        setDrafts(drafts);
        setIsLoading(false);

        setHasReachedLimit(drafts.length >= MAX_DRAFT_LIMIT_PER_WALLET);
    }, [address]);

    useEffect(() => {
        updateDraftState();
    }, [address]);

    /**
     * Add new draft gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GalleryDraft>}
     */
    const add = async (draft: GalleryDraft): Promise<GalleryDraft> => {
        const { id, ...draftToSave } = draft;
        const drafts = await allDrafts();

        if (drafts.length >= MAX_DRAFT_LIMIT_PER_WALLET) {
            throw new Error("[useWalletDraftGalleries:add] Limit Reached");
        }

        setIsSaving(true);

        const savedId = await database.add({
            ...draftToSave,
            updatedAt: new Date().getTime(),
        });

        setIsSaving(false);

        return await findByIdOrThrow(savedId);
    };

    /**
     * Update existing gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GalleryDraft>}
     */
    const update = async (draft: GalleryDraft): Promise<GalleryDraft> => {
        if (!isTruthy(draft.id)) {
            throw new Error("[useWalletDraftGalleries:update] Missing Id");
        }

        setIsSaving(true);

        await database.update({
            ...draft,
            updatedAt: new Date().getTime(),
        });

        setIsSaving(false);

        return await findByIdOrThrow(draft.id);
    };

    /**
     * Upsert gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GalleryDraft>}
     */
    const upsert = async (draft: GalleryDraft): Promise<GalleryDraft> => {
        if (isTruthy(draft.id)) {
            return await update(draft);
        }

        return await add(draft);
    };

    /**
     * Remove gallery.
     *
     * @param {number} id
     * @returns {Promise<void>}
     */
    const remove = async (id?: number | null): Promise<void> => {
        if (isTruthy(id)) {
            await database.deleteRecord(id);
            await updateDraftState();
        }
    };

    /**
     * Remove expired galleries.
     *
     * @returns {Promise<void>}
     */
    const removeExpired = async (): Promise<void> => {
        const drafts: GalleryDraft[] = await database.getAll();

        for (const draft of drafts) {
            if (isExpired(draft) && isTruthy(draft.id)) {
                void remove(draft.id);
            }
        }
    };

    /**
     * Get all drafts
     *
     * @returns {Promise<GalleryDraft[]>}
     */
    const allDrafts = async (): Promise<GalleryDraft[]> => {
        const allDrafts: GalleryDraft[] = await database.getAll();
        return allDrafts.filter((draft) => draft.walletAddress === address && !isExpired(draft));
    };

    /**
     * Find gallery
     *
     * @param {number} id
     * @returns {Promise<GalleryDraft>}
     */
    const findById = async (id: number | string): Promise<GalleryDraft | undefined> => {
        const draft = await database.getByID(Number(id));

        if (draft.walletAddress !== address) {
            return undefined;
        }

        return draft;
    };

    /**
     * Determine if gallery is expired.
     *
     * @param {GalleryDraft} draft
     * @returns {boolean}
     */
    const isExpired = (draft: GalleryDraft): boolean => {
        const thresholdDaysAgo = new Date().getTime() - DRAFT_TTL_DAYS * 86400 * 1000;
        return (draft.updatedAt ?? 0) < thresholdDaysAgo;
    };

    /**
     * Find draft or throw. Used internally for add/remove.
     *
     * @param {number | string} id
     * @returns {Promise<GalleryDraft>}
     */
    const findByIdOrThrow = async (id: number | string): Promise<GalleryDraft> => {
        const draft = await findById(id);

        if (!isTruthy(draft)) {
            throw new Error(`[useWalletDraftGalleries:findByIdOrThrow] Draft ${id} was not found.`);
        }

        return draft;
    };

    return {
        upsert,
        remove,
        removeExpired,
        drafts,
        findById,
        isLoading,
        isSaving,
        hasReachedLimit,
    };
};
