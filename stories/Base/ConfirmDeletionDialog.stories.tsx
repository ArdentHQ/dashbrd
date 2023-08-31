import { useArgs } from "@storybook/preview-api";
import type { Meta } from "@storybook/react";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";
import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Base/ConfirmDeletionDialog",
    component: ConfirmDeletionDialog,
    argTypes: {
        isOpen: {
            control: "boolean",
            defaultValue: false,
        },
        title: { control: "text", defaultValue: "Delete something" },
        onClose: {
            action: "closed",
        },
        onConfirm: {
            action: "confirmed",
        },
    },
} as Meta<typeof ConfirmDeletionDialog>;

export const Default = {
    args: {
        isOpen: false,
        title: "Delete soomething",
    },
    render: (args) => {
        const [{ isOpen, onClose }, setArgs] = useArgs();

        const handleClose = () => {
            setArgs({ ...args, isOpen: !isOpen });
            onClose();
        };

        return (
            <div>
                <div className="my-64 flex w-full items-center justify-center">
                    <Button
                        type="button"
                        onClick={() => setArgs({ ...args, isOpen: !isOpen })}
                    >
                        Show dialog
                    </Button>

                    <ConfirmDeletionDialog
                        title={args.title}
                        onConfirm={args.onConfirm}
                        isOpen={isOpen}
                        onClose={handleClose}
                    >
                        Are you sure?
                    </ConfirmDeletionDialog>
                </div>
            </div>
        );
    },
};
