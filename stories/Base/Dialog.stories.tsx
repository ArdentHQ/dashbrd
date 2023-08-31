import { useArgs } from "@storybook/preview-api";
import type { StoryFn, Meta } from "@storybook/react";
import { Dialog } from "@/Components/Dialog";
import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Base/Dialog",
    component: Dialog,
    argTypes: {
        isOpen: {
            control: "boolean",
            defaultValue: false,
        },
        title: { control: "text", defaultValue: "About Collection" },
        onClose: {
            action: "closed",
        },
    },
} as Meta<typeof Dialog>;

export const Default = {
    args: {
        isOpen: false,
        title: "About Collection",
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

                    <Dialog
                        title={args.title}
                        isOpen={isOpen}
                        onClose={handleClose}
                    >
                        <div className="leading-6 text-theme-secondary-700">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                            cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </div>
                    </Dialog>
                </div>
            </div>
        );
    },
};
