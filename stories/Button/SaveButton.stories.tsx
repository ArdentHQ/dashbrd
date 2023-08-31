import React from "react";
import type { Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { SaveButton } from "@/Components/Buttons/SaveButton";

export default {
    title: "Base/Button/Icon",
    component: SaveButton,
    argTypes: {
        type: ButtonArguments.type,
        disabled: ButtonArguments.disabled,
        icon: {
            ...ButtonArguments.icon,
            defaultValue: "Bookmark",
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
} as Meta<typeof SaveButton>;

export const Save = {
    render: (args) => <SaveButton {...args} />,
    args: {
        icon: "Bookmark",
    },
};
