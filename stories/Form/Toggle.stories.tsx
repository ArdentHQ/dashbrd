import type { Meta } from "@storybook/react";
import { Toggle } from "@/Components/Form/Toggle";
import { useArgs } from "@storybook/preview-api";
import { action } from "@storybook/addon-actions";

export default {
    title: "Form/Toggle",
    component: Toggle,
    argTypes: {
        checked: { control: "boolean", defaultValue: false },
        screenReaderLabel: { control: "text" },
        disabled: { control: "boolean", defaultValue: false },
        id: { control: "text" },
        name: { control: "text" },
        className: { control: "text" },
        onChange: { action: "clicked" },
    },
} as Meta<typeof Toggle>;

export const Default = (args) => {
    const [{ checked }, updateArgs] = useArgs();

    const toggle = (checked: boolean) => {
        updateArgs({
            checked,
        });

        action("onChange")(checked);
    };

    return (
        <Toggle
            {...args}
            onChange={toggle}
        />
    );
};
