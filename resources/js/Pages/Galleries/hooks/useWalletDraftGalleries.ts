import uniqBy from "lodash/uniqBy";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export interface GalleryDraftUnsaved {
    title: string;
    cover: ArrayBuffer | null;
    coverType: string | null;
    nfts: DraftNft[];
    walletAddress?: string;
    id?: number | null;
    value: string | null;
    updatedAt: number | null;
    coverFileName: string | null;
}

export interface GalleryDraft extends GalleryDraftUnsaved {
    id: number;
    collectionsCount: number;
}

interface WalletDraftGalleriesState {
    upsert: (draft: GalleryDraftUnsaved) => Promise<GalleryDraft>;
    add: (draft: GalleryDraftUnsaved) => Promise<GalleryDraft>;
    remove: (id?: number | null) => Promise<void>;
    removeExpired: () => Promise<void>;
    drafts: GalleryDraft[];
    findWalletDraftById: (id: number | string) => Promise<GalleryDraft | undefined>;
    isLoading: boolean;
    isSaving: boolean;
    hasReachedLimit: boolean;
    allDrafts: () => Promise<GalleryDraft[]>;
}

/**
 * Calculate collections count based on saved nfts.
 *
 * @param {GalleryDraft} draft
 * @returns {number}
 */
const calculateCollectionsCount = (draft: GalleryDraftUnsaved): number => uniqBy(draft.nfts, "collectionSlug").length;

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
 * Note: The react-indexed-db-hook package that is used under the hood in this hook
 *       is not reactive. That means that if this hook is used in multiple components,
 *       the state won't re-render on changes happening in indexedDB. `allDrafts` need to be
 *       explicitly to update the state (applies for isLoading, isSaving, hasReachedLimit, and `drafts`).
 *
 *       For a reactive indexedDB hook,see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 *
 * @param {Properties}
 * @returns {WalletDraftGalleriesState}
 */
export const useWalletDraftGalleries = ({ address }: Properties): WalletDraftGalleriesState => {
    const database = useIndexedDB("gallery-drafts");
    const [drafts, setDrafts] = useState<GalleryDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasReachedLimit, setHasReachedLimit] = useState(false);
    const { t } = useTranslation();

    const updateDraftState = useCallback(async () => {
        setIsLoading(true);

        const drafts = await allDrafts();

        setDrafts(drafts);
        setIsLoading(false);

        setHasReachedLimit(drafts.length >= MAX_DRAFT_LIMIT_PER_WALLET);
    }, [address]);

    useEffect(() => {
        void updateDraftState();
    }, [address]);

    /**
     * Add new draft gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GallerySavedDraft>}
     */
    const add = async (draft: GalleryDraftUnsaved): Promise<GalleryDraft> => {
        const { id: _, ...draftToSave } = draft;
        const allDraftsCount = await allDrafts();

        if (allDraftsCount.length >= MAX_DRAFT_LIMIT_PER_WALLET) {
            throw new Error("[useWalletDraftGalleries:upsert] Reached limit");
        }

        const errors = validate(draft);

        if (errors.length > 0) {
            throw new Error(`[useWalletDraftGalleries:add] Validation failed. Reason ${errors.join(",")}`);
        }

        setIsSaving(true);

        const id = await database.add({
            ...draftToSave,
            updatedAt: new Date().getTime(),
            collectionsCount: calculateCollectionsCount(draft),
        });

        setIsSaving(false);

        return await findByIdOrThrow(id);
    };

    /**
     * Validate draft before saving. Return errors if all fail.
     * Drafts can be saved if either title or nfts are set. Otherwise both are required.
     *
     * @param {GalleryDraftUnsaved} draft
     * @returns {string[]}
     */
    const validate = (draft: GalleryDraftUnsaved): string[] => {
        let titleError: string | undefined;
        let nftsError: string | undefined;
        let coverImageError: string | undefined;

        if (!isTruthy(draft.title.trim())) {
            titleError = `[useWalletDraftGalleries:validate] ${t("validation.gallery_title_required")}`;
        }

        if (draft.title.trim().length > 50) {
            titleError = `[useWalletDraftGalleries:validate] ${t("pages.galleries.create.title_too_long", {
                max: 50,
            })}`;
        }

        if (draft.nfts.length === 0) {
            nftsError = `[useWalletDraftGalleries:validate] ${t("validation.nfts_required")}`;
        }

        if (!isTruthy(draft.cover)) {
            coverImageError = `[useWalletDraftGalleries:validate] Cover image is missing`;
        }

        if (isTruthy(titleError) && isTruthy(nftsError) && isTruthy(coverImageError)) {
            return [titleError, nftsError, coverImageError];
        }

        return [];
    };

    /**
     * Update existing gallery.
     *
     * @param {GalleryDraft} draft
     * @returns {Promise<GallerySavedDraft>}
     */
    const update = async (draft: GalleryDraftUnsaved): Promise<GalleryDraft> => {
        if (!isTruthy(draft.id)) {
            throw new Error("[useWalletDraftGalleries:update] Missing Id");
        }

        const errors = validate(draft);

        if (errors.length > 0) {
            throw new Error(`[useWalletDraftGalleries:update] Validation failed. Reason ${errors.join(",")}`);
        }

        setIsSaving(true);

        await database.update({
            ...draft,
            updatedAt: new Date().getTime(),
            collectionsCount: calculateCollectionsCount(draft),
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
    const upsert = async (draft: GalleryDraftUnsaved): Promise<GalleryDraft> => {
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
     * Get all drafts.
     *
     * @returns {Promise<GalleryDraft[]>}
     */
    const allDrafts = async (): Promise<GalleryDraft[]> => {
        const allDrafts: GalleryDraft[] = await database.getAll();
        return allDrafts.filter(
            (draft) => draft.walletAddress?.toLowerCase() === address.toLowerCase() && !isExpired(draft),
        );
    };

    /**
     * Find gallery.
     *
     * @param {number} id
     * @returns {Promise<GalleryDraft>}
     */
    const findWalletDraftById = async (id: number | string): Promise<GalleryDraft | undefined> => {
        const draft: GalleryDraft | undefined = await database.getByID(Number(id));

        if (draft?.walletAddress?.toLowerCase() !== address.toLowerCase()) {
            return undefined;
        }

        return draft;
    };

    /**
     * Find draft or throw. Used internally for add/remove.
     *
     * @param {number | string} id
     * @returns {Promise<GalleryDraft>}
     */
    const findByIdOrThrow = async (id: number | string): Promise<GalleryDraft> => {
        const draft = await findWalletDraftById(id);

        if (!isTruthy(draft)) {
            throw new Error(`[useWalletDraftGalleries:findByIdOrThrow] Draft ${id} was not found.`);
        }

        return draft;
    };

    return {
        add,
        upsert,
        remove,
        removeExpired,
        drafts,
        findWalletDraftById,
        isLoading,
        isSaving,
        hasReachedLimit,
        allDrafts,
    };
};
