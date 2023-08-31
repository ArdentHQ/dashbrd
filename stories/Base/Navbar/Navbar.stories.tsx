import type { Meta } from "@storybook/react";
import { Navbar } from "@/Components/Layout/Navbar";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";

export default {
    title: "Base/Navbar",
    component: Navbar,
    argTypes: {
        wallet: {
            control: "select",
            options: ["Logged In", "Logged Out"],
            defaultValue: "Logged Out",
            mapping: {
                "Logged In": {
                    address: "0x1234567890123456789012345678901234567890",
                },
                "Logged Out": null,
            },
        },
        initialized: { control: false, defaultValue: true, table: { disable: true } },
        connecting: { control: false, defaultValue: false, table: { disable: true } },
        connectWallet: {
            control: false,
            defaultValue: () => {
                console.log("connect pressed");
            },
            table: { disable: true },
        },
        authenticated: {
            control: false,
            table: { disable: true },
        },
    },
} as Meta<typeof Navbar, "initialized">;

export const Guest = {
    render: (args) => {
        return (
            <EnvironmentContextProvider
                environment="storybook"
                features={{ collections: true, galleries: true, portfolio: true }}
            >
                <Navbar
                    {...args}
                    authenticated={args.wallet !== null}
                />
            </EnvironmentContextProvider>
        );
    },
};
