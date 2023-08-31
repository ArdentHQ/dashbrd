import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { ButtonLink } from "@/Components/Buttons/ButtonLink";

export default {
    title: "Base/Button",
    component: ButtonLink,

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
            options: ["primary", "secondary"],
            defaultValue: "primary",
        },
    },
} as Meta<typeof ButtonLink>;

const Template: StoryFn<typeof ButtonLink> = (args) => <ButtonLink {...args} />;

export const Link = Template.bind({});

Link.args = {
    children: "Button Link",
    href: "#",
};
