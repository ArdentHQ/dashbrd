import { useArgs } from "@storybook/preview-api";
import type { StoryFn, Meta } from "@storybook/react";
import { Slider } from "@/Components/Slider";
import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Base/Slider",
    component: Slider,
    argTypes: {
        isOpen: {
            control: "boolean",
            defaultValue: false,
        },
        onClose: {
            action: "closed",
        },
        header: {
            control: "text",
            defaultValue: "Header",
        },
        content: {
            control: "text",
            defaultValue: "This is the content.",
        },
    },
} as Meta<typeof Slider>;

export const Default = {
    args: {
        isOpen: false,
        content: "This is the content.",
        header: "Header",
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
                        Show Slider
                    </Button>

                    <Slider
                        isOpen={isOpen}
                        onClose={handleClose}
                    >
                        <Slider.Header>
                            <span className="text-lg font-medium leading-8">{args.header}</span>
                        </Slider.Header>

                        <Slider.Content>{args.content}</Slider.Content>
                    </Slider>
                </div>
            </div>
        );
    },
};
