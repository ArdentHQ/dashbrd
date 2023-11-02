import { type PageProps, type VisitOptions } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
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
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { GalleryNameInput } from "@/Pages/Galleries/Components/GalleryNameInput";
import { useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { useGalleryForm } from "@/Pages/Galleries/hooks/useGalleryForm";
import { assertUser, assertWallet } from "@/Utils/assertions";
import { getQueryParameters } from "@/Utils/get-query-parameters";
import { isTruthy } from "@/Utils/is-truthy";
import { replaceUrlQuery } from "@/Utils/replace-url-query";

interface Properties {
    auth: PageProps["auth"];
    nfts: App.Data.Gallery.GalleryNftData[];
    collections: App.Data.Gallery.GalleryCollectionsData;
    title: string;
    gallery?: App.Data.Gallery.GalleryData;
    nftsPerPage: number;
    nftLimit: number;
}

const Create = ({
    auth,
    title,
    nfts: paginatedNfts,
    collections: paginatedCollections,
    gallery,
    nftsPerPage,
    nftLimit,
}: Properties): JSX.Element => {
    assertUser(auth.user);
    assertWallet(auth.wallet);

    const { t } = useTranslation();
    const { props } = usePage();

    const { signedAction } = useAuthorizedAction();

    const { initialized } = useMetaMaskContext();

    const [isGalleryFormSliderOpen, setIsGalleryFormSliderOpen] = useState(false);
    const [gallerySliderActiveTab, setGallerySliderActiveTab] = useState<GalleryFormSliderTabs>();
    const [galleryCoverImageUrl, setGalleryCoverImageUrl] = useState<string | undefined>(gallery?.coverImage ?? "");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [busy, setBusy] = useState(false);

    const { draftId } = getQueryParameters();

    const { setDraftCover, setDraftNfts, setDraftTitle, draft, isSaving, deleteDraft } = useGalleryDrafts(
        isTruthy(draftId) ? Number(draftId) : undefined,
        isTruthy(gallery?.slug),
    );

    useEffect(() => {
        if (draft.id !== null) {
            replaceUrlQuery({ draftId: draft.id.toString() });
        }
    }, [draft.id]);

    const { selectedNfts, data, setData, errors, submit, updateSelectedNfts, processing } = useGalleryForm({
        gallery,
        setDraftNfts,
        deleteDraft: (): void => {
            void deleteDraft();
            replaceUrlQuery({ draftId: "" });
        },
    });

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

    const publishHandler = (event: FormEvent<Element>): void => {
        void signedAction(() => {
            submit(event);
        });
    };

    return (
        <LayoutWrapper
            withSlider
            toastMessage={props.toast}
            belowHeader={<NoNftsOverlay show={paginatedNfts.length === 0} />}
            displayAuthOverlay={paginatedNfts.length > 0 && initialized}
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
                        setDraftTitle(data.name);
                    }}
                />

                <EditableGalleryHook
                    selectedNfts={gallery?.nfts.paginated.data}
                    nftLimit={nftLimit}
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
                            nfts={paginatedNfts}
                            nftsPerPage={nftsPerPage}
                            pageMeta={{
                                first_page_url: paginatedCollections.paginated.meta.first_page_url,
                                total: paginatedCollections.paginated.meta.total,
                                next_page_url: paginatedCollections.paginated.meta.next_page_url,
                                per_page: paginatedCollections.paginated.meta.per_page,
                            }}
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
                    setDraftTitle(data.name);
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
                        setDraftCover(null, null);
                    } else {
                        setData("coverImage", new File([blob], blob.name, { type: blob.type }));
                        // eslint-disable-next-line promise/prefer-await-to-then
                        void blob.arrayBuffer().then((buf) => {
                            setDraftCover(buf, blob.type);
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
