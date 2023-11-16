import { router } from "@inertiajs/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";
import { useAuth } from "@/Contexts/AuthContext";
import { type GalleryDraft, useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { assertWallet } from "@/Utils/assertions";

export const GalleryDraftDeleteButton = ({ draftId }: { draftId: number }): JSX.Element => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { wallet } = useAuth();

    assertWallet(wallet);

    const [draft, setDraft] = useState<GalleryDraft>();

    const { remove, findWalletDraftById } = useWalletDraftGalleries({ address: wallet.address });

    useEffect(() => {
        void (async () => {
            setDraft(await findWalletDraftById(draftId));
        })();
    }, [draftId]);

    const deleteDraft = (): void => {
        void remove(draftId);

        router.visit(
            route("my-galleries", {
                draft: true,
            }),
        );
    };

    return (
        <>
            <IconButton
                data-testid="GalleryActionToolbar__draftDelete"
                icon="Trash"
                className="flex sm:hidden lg:flex"
                onClick={() => {
                    if (draft === undefined) {
                        return;
                    }

                    if (draft.title.length === 0 && draft.nfts.length === 0) {
                        deleteDraft();
                    } else {
                        setOpen(true);
                    }
                }}
                disabled={draft === undefined}
            />

            <ConfirmDeletionDialog
                title={t("pages.galleries.delete_modal.title")}
                isOpen={open}
                onClose={() => {
                    setOpen(false);
                }}
                onConfirm={deleteDraft}
                isDisabled={false}
            >
                {t("pages.galleries.delete_modal.confirmation_text")}
            </ConfirmDeletionDialog>
        </>
    );
};
