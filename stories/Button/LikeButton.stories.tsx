import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { LikeButton } from "@/Components/Buttons/LikeButton";

export default {
    title: "Base/Button",
    component: LikeButton,
    argTypes: {
        type: ButtonArguments.type,
        disabled: ButtonArguments.disabled,
        icon: {
            ...ButtonArguments.icon,
            defaultValue: "Heart",
        },
        iconClass: ButtonArguments.iconClass,
        className: ButtonArguments.className,
        onClick: ButtonArguments.onClick,
        selected: {
            control: "radio",
            options: [true, false],
            defaultValue: false,
        },
    },
} as Meta<typeof LikeButton>;

export const Like = {
    render: (args) => <LikeButton {...args}>234</LikeButton>,
    args: {
        icon: "Heart",
    },
};
