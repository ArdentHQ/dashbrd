import { isTruthy } from "@/Utils/is-truthy";
import { useCallback, useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";

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

export const useWalletDraftGalleries = ({ address }: Properties) => {
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

        return findById(savedId);
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

        return findById(draft.id);
    };

    /**
     * Upsert gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GalleryDraft>}
     */
    const upsert = (draft: GalleryDraft): Promise<GalleryDraft> => {
        if (isTruthy(draft.id)) {
            return update(draft);
        }

        return add(draft);
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
            setDrafts(await allDrafts());
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

    return {
        upsert,
        remove,
        removeExpired,
        drafts,
        findById,
        allDrafts,
        isLoading,
        isSaving,
        hasReachedLimit,
    };
};
