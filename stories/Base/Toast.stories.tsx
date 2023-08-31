import type { StoryFn, Meta } from "@storybook/react";
import { Toast, ToastContainer } from "@/Components/Toast";
import { useToasts } from "@/Hooks/useToasts";
import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Base/Toast",
    component: Toast,
    argTypes: {
        message: {
            control: "text",
        },

        type: {
            control: "select",
            options: ["pending", "success", "warning", "error", "info"],
        },

        isExpanded: {
            control: "boolean",
            defaultValue: false,
        },

        isLoading: {
            control: "boolean",
            defaultValue: false,
        },

        isStatic: {
            control: "boolean",
            defaultValue: false,
            description:
                "If enabled, toast won't autoclose and can't be closed manually. This is useful for persistent errors that require user to act (for example 419 Session Expired error codes)",
        },

        onClose: {
            action: "clicked",
        },
    },
} as Meta<typeof Toast>;

const template: StoryFn<typeof Toast> = (args) => <Toast {...args} />;

export const Default = template.bind({});
export const Expanded = template.bind({});
export const Static = template.bind({});
export const ExpandedAndStatic = template.bind({});

export const Loading = template.bind({});

export const Interactive = () => {
    const { showToast } = useToasts();

    return (
        <div>
            <div className="flex items-center space-x-2">
                <Button
                    type="button"
                    onClick={() =>
                        showToast({
                            message: "This is a regular toast",
                            type: "success",
                            isExpanded: false,
                            isStatic: false,
                            isLoading: false,
                        })
                    }
                >
                    Show toast
                </Button>

                <Button
                    type="button"
                    onClick={() =>
                        showToast({
                            message: "This is an expanded toast",
                            type: "warning",
                            isExpanded: true,
                            isStatic: false,
                            isLoading: false,
                        })
                    }
                >
                    Show expanded toast
                </Button>

                <Button
                    type="button"
                    onClick={() =>
                        showToast({
                            message: "This is a static toast",
                            type: "error",
                            isExpanded: false,
                            isStatic: true,
                            isLoading: false,
                        })
                    }
                >
                    Show static toast
                </Button>

                <Button
                    type="button"
                    onClick={() =>
                        showToast({
                            message: "This is a loading toast",
                            type: "error",
                            isExpanded: false,
                            isStatic: false,
                            isLoading: true,
                        })
                    }
                >
                    Show loading toast
                </Button>
            </div>

            <ToastContainer listenForInertia={false} />
        </div>
    );
};

Default.args = {
    message: "This is a toast message",
    type: "pending",
};

Expanded.args = {
    message: "This is a toast message",
    type: "pending",
    isExpanded: true,
};

Static.args = {
    message: "This is a toast message",
    type: "pending",
    isStatic: true,
};

ExpandedAndStatic.args = {
    message: "This is a toast message",
    type: "pending",
    isExpanded: true,
    isStatic: true,
};

Loading.args = {
    message: "This is a toast message",
    type: "pending",
    isLoading: true,
};
