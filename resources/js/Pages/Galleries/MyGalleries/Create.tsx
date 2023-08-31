import { type PageProps, type VisitOptions } from "@inertiajs/core";
import { Head, router, useForm, usePage } from "@inertiajs/react";
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
import { useToasts } from "@/Hooks/useToasts";
import { GalleryNameInput } from "@/Pages/Galleries/Components/GalleryNameInput";
import { assertUser, assertWallet } from "@/Utils/assertions";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    auth: PageProps["auth"];
    nfts: App.Data.Gallery.GalleryNftData[];
    collections: App.Data.Gallery.GalleryCollectionsData;
    title: string;
    gallery?: App.Data.Gallery.GalleryData;
    nftsPerPage: number;
}

const Create = ({
    auth,
    title,
    nfts: paginatedNfts,
    collections: paginatedCollections,
    gallery,
    nftsPerPage,
}: Properties): JSX.Element => {
    assertUser(auth.user);
    assertWallet(auth.wallet);

    const { t } = useTranslation();
    const { showToast } = useToasts();
    const { props } = usePage();

    const [isGalleryFormSliderOpen, setIsGalleryFormSliderOpen] = useState(false);
    const [gallerySliderActiveTab, setGallerySliderActiveTab] = useState<GalleryFormSliderTabs>();
    const [galleryCoverImageUrl, setGalleryCoverImageUrl] = useState<string | undefined>(gallery?.coverImage ?? "");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [busy, setBusy] = useState(false);

    const [selectedNfts, setSelectedNfts] = useState<App.Data.Gallery.GalleryNftData[]>([]);

    /* TODO (@alfonsobries) [2023-09-01]: calculate the value (https://app.clickup.com/t/862jkb9e2) */
    const totalValue = 0;

    assertUser(auth.user);

    const { data, setData, post, processing, errors, ...form } = useForm<{
        id: number | null;
        name: string;
        nfts: number[];
        coverImage: File | string | null;
    }>({
        id: gallery?.id ?? null,
        name: gallery?.name ?? "",
        nfts: [],
        coverImage: gallery?.coverImage ?? null,
    });

    const collections = useMemo<Array<Pick<App.Data.Nfts.NftCollectionData, "website" | "name" | "image">>>(
        () =>
            uniqBy(selectedNfts, (nft) => nft.tokenAddress).map((nft) => ({
                name: nft.collectionName,
                website: nft.collectionWebsite,
                image: nft.collectionImage,
            })),
        [selectedNfts],
    );

    useEffect(() => {
        if (selectedNfts.length === data.nfts.length) {
            return;
        }

        setData(
            "nfts",
            [...selectedNfts].map((nft) => nft.id),
        );
    }, [selectedNfts, setData]);

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

    const handleNameChange = useCallback(
        (name: string) => {
            setData("name", name);

            if (validateName(name)) {
                form.setError("name", "");
            }
        },
        [form],
    );

    return (
        <LayoutWrapper
            withSlider
            toastMessage={props.toast}
        >
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <GalleryNameInput
                    maxLength={50}
                    error={errors.name}
                    name={data.name}
                    onChange={handleNameChange}
                />

                <EditableGalleryHook selectedNfts={gallery?.nfts.paginated.data}>
                    {/* TODO (@alexbarnsley) [2023-09-01] calculate gallery value on the fly - https://app.clickup.com/t/862jkb9e2 */}
                    <GalleryHeading
                        value={totalValue}
                        nftsCount={selectedNfts.length}
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
                                onChange={setSelectedNfts}
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
                onPublish={submit}
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
                    } else {
                        setData("coverImage", new File([blob], blob.name, { type: blob.type }));
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
