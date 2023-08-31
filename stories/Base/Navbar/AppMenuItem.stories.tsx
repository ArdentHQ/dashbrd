import type { Meta } from "@storybook/react";

import { AppMenuItem as Component } from "@/Components/Navbar/AppMenuItem";

export default {
    title: "Base/Navbar",
    component: Component,
    argTypes: {
        iconClass: {
            type: "select",
            options: ["Wallet", "Communities", "Collections"],
            defaultValue: "Wallet",
            mapping: {
                Wallet: "bg-theme-hint-50 text-theme-hint-600",
                Communities: "bg-theme-success-50 text-theme-success-600",
                Collections: "bg-theme-warning-50 text-theme-warning-600",
            },
        },

        icon: {
            type: "select",
            options: ["Wallet", "Communities", "Collections"],
            defaultValue: "Wallet",
            mapping: {
                Wallet: "WalletOpacity",
                Communities: "UserTeamOpacity",
                Collections: "DiamondOpacity",
            },
        },

        title: {
            type: "string",
        },

        disabled: {
            control: "radio",
            options: [true, false],
            defaultValue: false,
        },

        external: {
            control: "radio",
            options: [true, false],
            defaultValue: false,
        },
    },
} as Meta<typeof Component>;

export const AppMenuItem = {
    args: {
        iconClass: "Wallet",
        icon: "Wallet",
    },
    render: (args) => (
        <nav>
            <div className="app-menu">
                <Component {...args} />
            </div>
        </nav>
    ),
};
