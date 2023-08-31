import { ComponentMeta } from "@storybook/react";
import { TextInput } from "@/Components/Form/TextInput";
import { Tooltip } from "@/Components/Tooltip";

export default {
    title: "Base/Tooltip",
    component: Tooltip,
    argTypes: {
        content: {
            control: "text",
        },

        placement: {
            control: "select",
            options: ["top", "right", "bottom", "left"],
        },
    },
} as ComponentMeta<typeof Tooltip>;

const template = (args) => (
    <div className="mt-20 flex h-full w-full items-center justify-center">
        <Tooltip {...args}>
            <button type="button">Hover me</button>
        </Tooltip>
    </div>
);

const component = (args) => (
    <div className="mt-20 flex h-full w-full flex-col items-center justify-center space-y-10">
        <Tooltip
            offset={[0, 7]}
            {...args}
        >
            <span tabIndex={-1}>
                <TextInput
                    className="w-96"
                    placeholder="With span (should show tooltip)"
                    disabled
                />
            </span>
        </Tooltip>

        <Tooltip
            offset={[0, 7]}
            {...args}
        >
            <TextInput
                className="w-96"
                placeholder="Without span (does not show tooltip because disabled)"
                disabled
            />
        </Tooltip>
    </div>
);

export const Default = template.bind({});
export const ComponentChild = component.bind({});

Default.args = {
    content: "This is some example tooltip",
    placement: "top",
};

ComponentChild.args = {
    content: "This is some example tooltip",
    placement: "top",
};
