import { type PageProps, type VisitOptions } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import uniqBy from "lodash/uniqBy";
import { type FormEvent, type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";
import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";
import { GalleryActionToolbar } from "@/Components/Galleries/GalleryPage/GalleryActionToolbar";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import { GalleryFormSlider, GalleryFormSliderTabs } from "@/Components/Galleries/GalleryPage/GalleryFormSlider";
import { GalleryHeading } from "@/Components/Galleries/GalleryPage/GalleryHeading";
import { EditableGalleryHook } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { GalleryNfts } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { NftGridEditable } from "@/Components/Galleries/NftGridEditable";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { NoNftsOverlay } from "@/Components/Layout/NoNftsOverlay";
import { useAuth } from "@/Contexts/AuthContext";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useToasts } from "@/Hooks/useToasts";
import { GalleryNameInput } from "@/Pages/Galleries/Components/GalleryNameInput";
import { useGalleryForm } from "@/Pages/Galleries/hooks/useGalleryForm";
import { useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { useWalletDraftGallery } from "@/Pages/Galleries/hooks/useWalletDraftGallery";
import { arrayBufferToFile } from "@/Utils/array-buffer-to-file";
import { assertUser, assertWallet } from "@/Utils/assertions";
import { fileToImageDataURI } from "@/Utils/file-to-image-data-uri";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

interface Properties {
    auth: PageProps["auth"];
    title: string;
    gallery?: App.Data.Gallery.GalleryData;
    nftsPerPage: number;
    collectionsPerPage: number;
    nftLimit: number;
    nftsCount: number;
}

const Create = ({
    auth,
    title,
    gallery,
    nftsPerPage,
    nftLimit,
    nftsCount,
    collectionsPerPage,
}: Properties): JSX.Element => {
    assertUser(auth.user);
    assertWallet(auth.wallet);

    const { t } = useTranslation();
    const { showToast } = useToasts();
    const { props } = usePage();

    const { signedAction } = useAuthorizedAction();

    const { initialized, switching } = useMetaMaskContext();

    const [isGalleryFormSliderOpen, setIsGalleryFormSliderOpen] = useState(false);
    const [gallerySliderActiveTab, setGallerySliderActiveTab] = useState<GalleryFormSliderTabs>();
    const [galleryCoverImageUrl, setGalleryCoverImageUrl] = useState<string | undefined>(gallery?.coverImage ?? "");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [busy, setBusy] = useState(false);
    const { draftId: queryDraftId } = getQueryParameters();
    const draftId: number | undefined = isTruthy(queryDraftId) ? Number(queryDraftId) : undefined;

    const [initialNfts, setInitialNfts] = useState<App.Data.Gallery.GalleryNftData[] | undefined>(
        gallery?.nfts.paginated.data,
    );

    const { wallet } = useAuth();
    assertWallet(wallet);

    const { remove } = useWalletDraftGalleries({ address: wallet.address });
    const { setCover, setNfts, setTitle, draft, isSaving, isLoading } = useWalletDraftGallery({
        draftId,
        address: wallet.address,
        isDisabled: isTruthy(gallery?.slug),
    });

    useEffect(() => {
        if (isLoading || isSaving) {
            return;
        }

        if (isTruthy(draft.id)) {
            replaceUrlQuery({ draftId: draft.id.toString() });
        }

        if (!isTruthy(draft.id) && isTruthy(draftId)) {
            replaceUrlQuery({ draftId: "" });
        }
    }, [draft.id, isLoading, isSaving]);

    const isEditingDraft = draft.id !== null && gallery === undefined;

    const { selectedNfts, data, setData, errors, submit, updateSelectedNfts, processing } = useGalleryForm({
        gallery,
        setDraftNfts: setNfts,
        draft: isEditingDraft ? draft : undefined,
        deleteDraft: (): void => {
            void remove(draft.id);

            replaceUrlQuery({ draftId: "" });
        },
    });

    useEffect(() => {
        if (!switching) return;

        updateSelectedNfts([], true);
        replaceUrlQuery({ draftId: "" });
    }, [switching]);

    useEffect(() => {
        const cover = data.coverImage;

        if (cover instanceof File) {
            // eslint-disable-next-line promise/prefer-await-to-then
            void cover.arrayBuffer().then((buf) => {
                setCover(buf, cover.type);
                setTitle(data.name);
            });
        } else if (isTruthy(data.name)) {
            setTitle(data.name);
        }
    }, [auth.wallet.address]);

    const totalValue = 0;

    assertUser(auth.user);

    const collections = useMemo<Array<Pick<App.Data.Nfts.NftCollectionData, "name" | "image" | "slug">>>(
        () =>
            uniqBy(selectedNfts, (nft) => nft.tokenAddress).map((nft) => ({
                name: nft.collectionName,
                image: nft.collectionImage,
                slug: nft.collectionSlug,
            })),
        [selectedNfts],
    );

    const handleGalleryDelete = useCallback(
        (slug: string) => {
            setBusy(true);

            router.visit(
                route("my-galleries.destroy", {
                    slug,
                }),
                {
                    replace: true,
                    method: "delete" as VisitOptions["method"],
                    onFinish: () => {
                        setBusy(false);
                    },
                },
            );
        },
        [gallery],
    );

    useEffect(() => {
        if (draft.id == null) {
            return;
        }

        const loadDraftCover = async (): Promise<void> => {
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

        const loadDraftNts = async (): Promise<void> => {
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
            }

            setInitialNfts(nfts);
        };

        void loadDraftCover();

        void loadDraftNts();
    }, [draft]);

    const publishHandler = (event: FormEvent<Element>): void => {
        void signedAction(() => {
            submit(event);
        });
    };

    return (
        <LayoutWrapper
            withSlider
            toastMessage={props.toast}
            belowHeader={<NoNftsOverlay show={nftsCount === 0} />}
            displayAuthOverlay={nftsCount > 0 && initialized}
            mustBeSigned={gallery !== undefined}
        >
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <GalleryNameInput
                    maxLength={50}
                    error={errors.name}
                    name={data.name}
                    onChange={(name) => {
                        setData("name", name);
                    }}
                    onBlur={() => {
                        setTitle(data.name);
                    }}
                />

                <EditableGalleryHook
                    selectedNfts={initialNfts}
                    nftLimit={nftLimit}
                    key={auth.wallet.address}
                >
                    <GalleryHeading
                        value={totalValue}
                        nftsCount={data.nfts.length}
                        collectionsCount={collections.length}
                        currency={auth.user.attributes.currency}
                    />

                    <div className="mt-4">
                        <GalleryControls
                            reportReasons={props.reportReasons}
                            showEditAction={false}
                            likesCount={gallery?.likes}
                            gallery={gallery}
                            wallet={auth.wallet}
                            isDisabled
                        />
                    </div>

                    <div className="space-y-4">
                        <GalleryNfts
                            nftsPerPage={nftsPerPage}
                            collectionsPerPage={collectionsPerPage}
                        >
                            <NftGridEditable
                                onChange={updateSelectedNfts}
                                error={errors.nfts}
                            />
                        </GalleryNfts>

                        <FeaturedCollectionsBanner collections={collections} />
                    </div>
                </EditableGalleryHook>
            </div>

            <GalleryActionToolbar
                showDelete={isTruthy(gallery)}
                isProcessing={processing}
                galleryCoverUrl={galleryCoverImageUrl}
                isSavingDraft={isSaving}
                draftId={draft.id ?? undefined}
                onCoverClick={({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
                    currentTarget.blur();
                    setGallerySliderActiveTab(GalleryFormSliderTabs.Cover);
                    setIsGalleryFormSliderOpen(true);
                }}
                onTemplateClick={({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
                    currentTarget.blur();
                    setGallerySliderActiveTab(GalleryFormSliderTabs.Template);
                    setIsGalleryFormSliderOpen(true);
                }}
                onDelete={() => {
                    setShowDeleteModal(true);
                }}
                onCancel={() => {
                    router.visit(route("my-galleries"));
                }}
                onPublish={publishHandler}
            />

            <GalleryFormSlider
                galleryCoverUrl={galleryCoverImageUrl}
                activeTab={gallerySliderActiveTab}
                isOpen={isGalleryFormSliderOpen}
                onClose={() => {
                    setIsGalleryFormSliderOpen(false);
                }}
                onSaveCoverUrl={({ blob, imageDataURI }) => {
                    setGalleryCoverImageUrl(imageDataURI);
                    if (blob === undefined) {
                        setData("coverImage", null);
                        setCover(null, null, null);
                    } else {
                        setData("coverImage", new File([blob], blob.name, { type: blob.type }));
                        // eslint-disable-next-line promise/prefer-await-to-then
                        void blob.arrayBuffer().then((buf) => {
                            setCover(buf, blob.name, blob.type);
                        });
                    }
                    setIsGalleryFormSliderOpen(false);
                }}
            />

            {isTruthy(gallery) && (
                <ConfirmDeletionDialog
                    title={t("pages.galleries.delete_modal.title")}
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                    }}
                    onConfirm={() => {
                        handleGalleryDelete(gallery.slug);
                    }}
                    isDisabled={busy}
                >
                    {t("pages.galleries.delete_modal.confirmation_text")}
                </ConfirmDeletionDialog>
            )}
        </LayoutWrapper>
    );
};

export default Create;
