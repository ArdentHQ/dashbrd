import { type PageProps, type VisitOptions } from "@inertiajs/core";
import { Head, router, usePage } from "@inertiajs/react";
import { type FormEvent, type MouseEvent, useCallback, useEffect, useState } from "react";
import CreateGalleryForm from "./Components/CreateGalleryForm";
import { MyGalleryDialogs } from "./Components/MyGalleryDialogs";
import { useDraftLoader } from "./hooks/useDraftLoader";
import { GalleryActionToolbar } from "@/Components/Galleries/GalleryPage/GalleryActionToolbar";
import { GalleryFormSlider, GalleryFormSliderTabs } from "@/Components/Galleries/GalleryPage/GalleryFormSlider";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { NoNftsOverlay } from "@/Components/Layout/NoNftsOverlay";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { usePrevious } from "@/Hooks/usePrevious";
import { useToasts } from "@/Hooks/useToasts";
import { useGalleryForm } from "@/Pages/Galleries/hooks/useGalleryForm";
import { type GalleryDraftUnsaved, useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { useWalletDraftGallery } from "@/Pages/Galleries/hooks/useWalletDraftGallery";
import { assertUser, assertWallet } from "@/Utils/assertions";
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
    nftCount: number;
    hiddenCollectionsCount: number;
}

const Create = ({
    auth,
    title,
    gallery,
    nftsPerPage,
    nftLimit,
    nftCount,
    collectionsPerPage,
    hiddenCollectionsCount,
}: Properties): JSX.Element => {
    assertUser(auth.user);
    assertWallet(auth.wallet);

    const { showToast } = useToasts();
    const { props } = usePage();
    const { signedAction } = useAuthorizedAction();
    const { initialized } = useMetaMaskContext();

    const [isGalleryFormSliderOpen, setIsGalleryFormSliderOpen] = useState(false);
    const [gallerySliderActiveTab, setGallerySliderActiveTab] = useState<GalleryFormSliderTabs>();
    const [galleryCoverImageUrl, setGalleryCoverImageUrl] = useState<string | undefined>(gallery?.coverImage ?? "");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [busy, setBusy] = useState(false);
    const { draftId, editDraft } = getQueryParameters();

    const [showDraftsLimitModal, setShowDraftsLimitModal] = useState(false);

    const [initialNfts, setInitialNfts] = useState<App.Data.Gallery.GalleryNftData[] | undefined>(
        gallery?.nfts.paginated.data,
    );

    const { remove, add, hasReachedLimit, allDrafts } = useWalletDraftGalleries({ address: auth.wallet.address });
    const { setCover, setNfts, setTitle, draft, isSaving, isLoading, reset } = useWalletDraftGallery({
        draftId,
        address: auth.wallet.address,
        isDisabled: isTruthy(gallery?.slug),
    });

    const deleteDraft = (): void => {
        void remove(draft.id);
        replaceUrlQuery({ draftId: "" });
    };

    const { data, setData, submit, processing, selectedNfts, errors, updateSelectedNfts } = useGalleryForm({
        gallery,
        setDraftNfts: setNfts,
        draft,
        deleteDraft,
    });

    const previousWallet = usePrevious(auth.wallet.address);

    useEffect(() => {
        if (!isLoading && !isTruthy(editDraft) && hasReachedLimit) {
            setShowDraftsLimitModal(hasReachedLimit);
        }
    }, [hasReachedLimit, isLoading]);

    useEffect(() => {
        if (isLoading || isSaving) {
            return;
        }

        const redirectToNewDraft = async (existingDraft: GalleryDraftUnsaved): Promise<void> => {
            try {
                const newDraft = await add({ ...existingDraft, walletAddress: auth.wallet?.address, nfts: [] });
                reset(newDraft);
                replaceUrlQuery({ draftId: newDraft.id.toString() });
            } catch (_error) {
                replaceUrlQuery({ draftId: "" });
            }
        };

        // Wallet is changed while editing.
        // Create a new draft, copy the title & cover from the existing one, add redirect to the new one.
        if (isTruthy(previousWallet) && previousWallet !== auth.wallet?.address) {
            void redirectToNewDraft(draft);
            return;
        }

        // Update url to reflect editing draft id.
        if (isTruthy(draft.id) && !isTruthy(draftId)) {
            replaceUrlQuery({ draftId: draft.id.toString() });
            return;
        }

        // Clean url if draft is empty.
        if (!isTruthy(draft.id) && isTruthy(draftId)) {
            replaceUrlQuery({ draftId: "" });
        }
    }, [draft.id, isLoading, isSaving, auth.wallet.address, previousWallet, data]);

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

    const { loadDraftCover, loadDraftNts } = useDraftLoader({
        setGalleryCoverImageUrl,
        showToast,
        setNfts,
        setInitialNfts,
    });

    useEffect(() => {
        if (draft.id == null) {
            return;
        }

        void loadDraftCover({ draft });
        void loadDraftNts({ draft });
    }, [draft]);

    const publishHandler = (event: FormEvent<Element>): void => {
        void signedAction(() => {
            submit(event);
        });
    };

    const handleDraftCancel = async (): Promise<void> => {
        const isDraft = isTruthy(draftId);

        if (!isDraft) {
            router.visit(route("my-galleries"));
            return;
        }

        const savedDrafts = await allDrafts();

        if (savedDrafts.length === 0) {
            router.visit(route("my-galleries"));
            return;
        }

        router.visit(route("my-galleries"), {
            data: {
                draft: 1,
            },
        });
    };

    /**
     * Remove empty draft when navigating away.
     */
    useEffect(() => {
        const abortListener = router.on("before", () => {
            const isEmpty = !isTruthy(data.name.trim()) && draft.nfts.length === 0 && !isTruthy(data.coverImage);

            if (isEmpty) {
                void remove(draft.id);
            }
        });

        return () => {
            abortListener();
        };
    }, [data, draft]);

    const deleteHandler = (): void => {
        void signedAction(() => {
            setShowDeleteModal(true);
        });
    };

    return (
        <LayoutWrapper
            withSlider
            toastMessage={props.toast}
            belowHeader={<NoNftsOverlay show={nftCount === 0} />}
            displayAuthOverlay={nftCount > 0 && initialized}
            mustBeSigned={gallery !== undefined}
        >
            <Head title={title} />

            <CreateGalleryForm
                gallery={gallery}
                setTitle={setTitle}
                initialNfts={initialNfts}
                nftLimit={nftLimit}
                auth={auth}
                reportReasons={props.reportReasons}
                nftsPerPage={nftsPerPage}
                collectionsPerPage={collectionsPerPage}
                hiddenCollectionsCount={hiddenCollectionsCount}
                data={data}
                setData={setData}
                selectedNfts={selectedNfts}
                updateSelectedNfts={updateSelectedNfts}
                errors={errors}
            />

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
                onDelete={deleteHandler}
                onCancel={() => {
                    void handleDraftCancel();
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

            <MyGalleryDialogs
                gallery={gallery}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleGalleryDelete={handleGalleryDelete}
                isBusy={busy}
                showDraftsLimitModal={showDraftsLimitModal}
                setShowDraftsLimitModal={setShowDraftsLimitModal}
            />
        </LayoutWrapper>
    );
};

export default Create;
