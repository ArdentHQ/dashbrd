import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { IconLikeButton } from "@/Components/Buttons/IconLikeButton";

export default {
    title: "Base/Button/Icon",
    component: IconLikeButton,
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
} as Meta<typeof IconLikeButton>;

export const Like = {
    render: (args) => <IconLikeButton {...args} />,
    args: {
        icon: "Heart",
    },
};
