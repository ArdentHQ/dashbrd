import { useForm } from "@inertiajs/react";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToasts } from "@/Hooks/useToasts";
import { useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

interface UseGalleryFormProperties extends Record<string, unknown> {
    id: number | null;
    name: string;
    nfts: number[];
    coverImage: File | string | null;
}

export const useGalleryForm = ({
    gallery,
}: {
    gallery?: App.Data.Gallery.GalleryData;
}): {
    selectedNfts: App.Data.Gallery.GalleryNftData[];
    gallery?: App.Data.Gallery.GalleryData;
    data: UseGalleryFormProperties;
    setData: (field: keyof UseGalleryFormProperties, value: string | number | number[] | null | File) => void;
    submit: (event: FormEvent) => void;
    errors: Partial<Record<keyof UseGalleryFormProperties, string>>;
    updateSelectedNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    processing: boolean;
    setDraftCover: (image: ArrayBuffer | null) => Promise<void>;
} => {
    const { t } = useTranslation();
    const [selectedNfts, setSelectedNfts] = useState<App.Data.Gallery.GalleryNftData[]>([]);
    const { showToast } = useToasts();

    const { draftId: givenDraftId } = getQueryParameters();

    const { setDraftCover, setDraftTitle, setDraftNfts, draft } = useGalleryDrafts(
        isTruthy(givenDraftId) ? Number(givenDraftId) : undefined,
    );

    useEffect(() => {
        draft.id != null && replaceUrlQuery({ draftId: draft.id.toString() });
    }, [draft.id]);

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
        });
    };

    const updateSelectedNfts = (nfts: App.Data.Gallery.GalleryNftData[]): void => {
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

        void setDraftNfts(nfts);
    };

    return {
        data,
        selectedNfts,
        updateSelectedNfts,
        submit,
        errors,
        processing,
        setDraftCover,
        setData: (field, value) => {
            setData(field, value);

            if (field === "name" && validateName(field)) {
                form.setError("name", "");
            }

            if (field === "name") {
                setDraftTitle(typeof value === "string" ? value : "");
            }
        },
    };
};
