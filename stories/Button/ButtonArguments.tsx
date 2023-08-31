import { action } from "@storybook/addon-actions";
import { SvgCollection } from "@/icons";

const iconOptions = [];

for (const icon of Object.keys(SvgCollection)) {
    iconOptions.push(icon);
}

export default {
    type: {
        control: "select",
        options: ["submit", "button", "reset"],
        defaultValue: "submit",
    },

    disabled: {
        control: "radio",
        options: [true, false],
        defaultValue: false,
    },

    icon: {
        control: "select",
        options: iconOptions,
        defaultValue: iconOptions[0],
    },

    iconClass: {
        control: "select",
        options: ["Default", "Override Colour", "Hover Colour Override"],
        defaultValue: "Default",
        mapping: {
            Default: "",
            "Override Colour": "text-theme-danger-500",
            "Hover Colour Override": "group-hover:text-theme-danger-500",
        },
    },

    className: {
        control: "select",
        options: ["Default", "Override Colour", "Hover Colour Override"],
        defaultValue: "Default",
        mapping: {
            Default: "",
            "Override Colour": "bg-theme-success-500 text-theme-success-50 hover:bg-theme-success-400",
            "Hover Colour Override": "hover:bg-theme-danger-100 hover:text-theme-danger-400",
        },
    },

    onClick: {
        control: "select",
        options: ["Do nothing", "Popup"],
        defaultValue: "Do nothing",
        mapping: {
            "Do nothing": action("onclick"),
            Popup: (e) => {
                alert("test");

                action("onclick")(e);
            },
        },
    },

    iconPosition: {
        control: "radio",
        options: ["left", "right"],
        defaultValue: "left",
    },
};
