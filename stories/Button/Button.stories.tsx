import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Base/Button",
    component: Button,

    argTypes: {
        ...ButtonArguments,

        icon: {
            ...ButtonArguments.icon,

            options: ["None", ...ButtonArguments.icon.options],
            defaultValue: "None",
            mapping: {
                None: null,
            },
        },

        variant: {
            options: ["primary", "secondary", "bordered", "danger"],
            defaultValue: "primary",
        },
    },
} as Meta<typeof Button>;

const Template: StoryFn<typeof Button> = (args) => <Button {...args} />;

export const Generic = Template.bind({});

Generic.args = {
    children: "Button Text",
};
