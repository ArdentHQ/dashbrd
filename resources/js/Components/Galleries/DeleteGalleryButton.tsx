import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";

const DeleteGalleryButton = ({ gallery }: { gallery: App.Data.Gallery.GalleryData }): JSX.Element => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { processing, delete: remove } = useForm({});

    const submit = (): void => {
        remove(
            route("my-galleries.destroy", {
                slug: gallery.slug,
            }),
            {
                onFinish: () => {
                    setOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Button
                icon="Trash"
                onClick={() => {
                    setOpen(true);
                }}
                variant="secondary"
                iconSize="md"
                className="bg-transparent p-2"
            />

            <ConfirmDeletionDialog
                title={t("pages.galleries.delete_modal.title")}
                isOpen={open}
                onClose={() => {
                    setOpen(false);
                }}
                onConfirm={submit}
                isDisabled={processing}
            >
                {t("pages.galleries.delete_modal.confirmation_text")}
            </ConfirmDeletionDialog>
        </>
    );
};

export default DeleteGalleryButton;
