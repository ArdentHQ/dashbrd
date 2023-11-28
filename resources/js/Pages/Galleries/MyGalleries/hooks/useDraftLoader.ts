import { arrayBufferToFile } from "@/Utils/array-buffer-to-file";
import { fileToImageDataURI } from "@/Utils/file-to-image-data-uri";
import { type GalleryDraftUnsaved } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import axios from "axios";
import { ToastMessage } from "@/Components/Toast";
import { useTranslation } from "react-i18next";

export const useDraftLoader = ({
    setGalleryCoverImageUrl,
    showToast,
    setNfts,
    setInitialNfts,
  }: {
    setGalleryCoverImageUrl: (url: string) => void;
    showToast: (toastMessage?: ToastMessage) => void
    setNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setInitialNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;

  }) => {
    const { t } = useTranslation();

    const loadDraftCover = async ({
        draft,
    }: {
        draft: GalleryDraftUnsaved;
    }): Promise<void> => {
        const file = arrayBufferToFile(draft.cover, draft.coverFileName, draft.coverType);

        if (file === null) {
            setGalleryCoverImageUrl("");

            return;
        }

        try {
            const imageDataURI = await fileToImageDataURI(file);
            setGalleryCoverImageUrl(imageDataURI);
        } catch {
            setGalleryCoverImageUrl("");
        }
    };

    const loadDraftNts = async ({
        draft,
    }: {
        draft: GalleryDraftUnsaved;
    }): Promise<void> => {
        const { data: nfts } = await axios.get<App.Data.Gallery.GalleryNftData[]>(
            route("user.nfts", {
                ids: draft.nfts.map((nft) => nft.nftId).join(","),
            }),
        );

        if (nfts.length < draft.nfts.length) {
            showToast({
                message: t("pages.galleries.my_galleries.nfts_no_longer_owned"),
                type: "warning",
            });

            setNfts(nfts);
            return;
        }

        setInitialNfts(nfts);
    };

    return {
        loadDraftCover,
        loadDraftNts,
    };
  };
