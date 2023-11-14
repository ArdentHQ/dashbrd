import { useForm } from "@inertiajs/react";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type GalleryDraft } from "./useWalletDraftGalleries";
import { useToasts } from "@/Hooks/useToasts";
import { arrayBufferToFile } from "@/Utils/array-buffer-to-file";
import { isTruthy } from "@/Utils/is-truthy";

export interface UseGalleryFormProperties extends Record<string, unknown> {
    id: number | null;
    name: string;
    nfts: number[];
    coverImage: File | string | null;
}

export const useGalleryForm = ({
    gallery,
    draft,
    setDraftNfts,
    deleteDraft,
}: {
    gallery?: App.Data.Gallery.GalleryData;
    draft?: GalleryDraft;
    setDraftNfts?: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    deleteDraft?: () => void;
}): {
    selectedNfts: App.Data.Gallery.GalleryNftData[];
    gallery?: App.Data.Gallery.GalleryData;
    data: UseGalleryFormProperties;
    setData: (field: keyof UseGalleryFormProperties, value: string | number | number[] | null | File) => void;
    submit: (event: FormEvent) => void;
    errors: Partial<Record<keyof UseGalleryFormProperties, string>>;
    updateSelectedNfts: (nfts: App.Data.Gallery.GalleryNftData[], disableDraft?: boolean) => void;
    processing: boolean;
} => {
    const { t } = useTranslation();
    const [selectedNfts, setSelectedNfts] = useState<App.Data.Gallery.GalleryNftData[]>([]);
    const { showToast } = useToasts();

    const { data, setData, post, processing, errors, ...form } = useForm<UseGalleryFormProperties>({
        id: gallery?.id ?? null,
        name: gallery?.name ?? "",
        nfts: [],
        coverImage: gallery?.coverImage ?? null,
    });

    const validateName = (name: string): boolean => {
        let isValid = true;

        if (!isTruthy(name.trim())) {
            isValid = false;
            form.setError("name", t("validation.gallery_title_required"));
        }

        if (name.length > 50) {
            isValid = false;
            form.setError("name", t("pages.galleries.create.title_too_long", { max: 50 }));
        }

        return isValid;
    };

    const validate = ({ name, nfts }: { nfts: number[]; name: string }): boolean => {
        let isValid = true;

        if (!validateName(name)) {
            isValid = false;
        }

        if (nfts.length === 0) {
            isValid = false;
            form.setError("nfts", t("validation.nfts_required"));
        }

        return isValid;
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();

        if (!validate(data)) {
            return;
        }

        post(route("my-galleries.store"), {
            onError: (errors) => {
                showToast({
                    message: Object.values(errors)[0],
                    type: "error",
                });
            },
            onSuccess: () => {
                deleteDraft?.();
            },
        });
    };

    const updateSelectedNfts = (nfts: App.Data.Gallery.GalleryNftData[], disableDraft = false): void => {
        // Convert them to strings to compare ordering too.
        const selectedNftsOrder = data.nfts.join();
        const nftsOrder = nfts.map((nft) => nft.id).join();
        // Avoid setting if values are the same as it causes infinite re-renders.
        if (selectedNftsOrder === nftsOrder) {
            return;
        }
        setSelectedNfts(nfts);
        setData(
            "nfts",
            nfts.map((nft) => nft.id),
        );

        if (!disableDraft) {
            setDraftNfts?.(nfts);
        }
    };

    useEffect(() => {
        if (draft?.id == null) {
            return;
        }

        setData({
            id: null,
            name: draft.title,
            nfts: [],
            coverImage: arrayBufferToFile(draft.cover, draft.coverFileName, draft.coverType),
        });
    }, [draft?.id ?? null]);

    return {
        data,
        selectedNfts,
        updateSelectedNfts,
        submit,
        errors,
        processing,
        setData: (field, value) => {
            setData(field, value);

            if (field === "name" && validateName(field)) {
                form.setError("name", "");
            }
        },
    };
};
