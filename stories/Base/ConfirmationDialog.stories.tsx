import { useArgs } from "@storybook/preview-api";
import type { Meta } from "@storybook/react";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { Button } from "@/Components/Buttons/Button";
import { Radio } from "@/Components/Form/Radio";

export default {
    title: "Base/ConfirmationDialog",
    component: ConfirmationDialog,
    argTypes: {
        isOpen: {
            control: "boolean",
            defaultValue: false,
        },
        isDisabled: {
            control: "boolean",
            defaultValue: false,
        },
        isStatic: {
            control: "boolean",
            defaultValue: false,
        },
        title: { control: "text", defaultValue: "Submit a Report" },
        confirmLabel: { control: "text", defaultValue: "Submit" },
        onClose: {
            action: "closed",
        },
        onConfirm: {
            action: "confirmed",
        },
    },
} as Meta<typeof ConfirmationDialog>;

export const Default = {
    args: {
        isOpen: false,
        confirmLabel: "Submit",
        title: "Submit a Report",
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

                    <ConfirmationDialog
                        title={args.title}
                        confirmLabel={args.confirmLabel}
                        onConfirm={args.onConfirm}
                        isOpen={isOpen}
                        isDisabled={args.isDisabled}
                        isStatic={args.isStatic}
                        onClose={handleClose}
                    >
                        <p className="leading-6 text-theme-secondary-700">
                            Thanks for looking out by reporting things that break the rules. Let us know what's
                            happening, and we'll review the reported comment.
                        </p>

                        <div className="mt-3 space-y-3">
                            {["first", "second", "third"].map((value) => {
                                return (
                                    <label
                                        className="flex items-center space-x-3"
                                        key={value}
                                    >
                                        <Radio
                                            name="testMultiple"
                                            value={value}
                                        />

                                        <p className="text-theme-secondary-700">Lorem, ipsum dolor sit amet</p>
                                    </label>
                                );
                            })}
                        </div>
                    </ConfirmationDialog>
                </div>
            </div>
        );
    },
};
