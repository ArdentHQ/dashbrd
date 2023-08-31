import React from "react";
import type { Meta } from "@storybook/react";
import ButtonArguments from "./ButtonArguments";

import { IconButton } from "@/Components/Buttons/IconButton";

export default {
    title: "Base/Button",
    component: IconButton,
    argTypes: {
        type: ButtonArguments.type,
        disabled: ButtonArguments.disabled,
        icon: ButtonArguments.icon,
        iconClass: ButtonArguments.iconClass,
        className: ButtonArguments.className,
        onClick: ButtonArguments.onClick,
        variant: {
            control: "radio",
            options: ["icon", "primary", "secondary", "danger"],
            defaultValue: "icon",
        },
        selected: {
            control: "radio",
            options: [true, false],
            defaultValue: false,
        },
        baseClassName: {
            control: "select",
            options: ["None", "Like", "Save"],
            mapping: { None: "", Like: "button-like", Save: "button-save" },
            defaultValue: "None",
        },
        selectedClassName: {
            control: "select",
            options: ["None", "Like", "Save"],
            mapping: { None: "", Like: "button-like-selected", Save: "button-save-selected" },
            defaultValue: "None",
        },
    },
} as Meta<typeof IconButton>;

export const GenericIcon = {
    render: (args) => <IconButton {...args} />,
    args: {
        icon: "Heart",
    },
};
