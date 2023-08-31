import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Icon } from "@/Components/Icon";
import { SvgCollection } from "@/icons";

const iconOptions = [];
for (const icon of Object.keys(SvgCollection)) {
    iconOptions.push(icon);
}

export default {
    title: "Base/Icon",
    component: Icon,
    argTypes: {
        name: {
            control: "select",
            options: iconOptions,
            defaultValue: "Logo",
        },
    },
} as ComponentMeta<typeof Icon>;

const Template: ComponentStory<typeof Icon> = (args) => <Icon {...args} />;

export const Default = Template.bind({});

Default.args = {
    name: "Logo",
    size: "2xl",
};
