import type { Meta } from "@storybook/react";

import { AppMenu as Component } from "@/Components/Navbar/AppMenu";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";

export default {
    title: "Base/Navbar",
    component: Component,
} as Meta<typeof Component>;

export const AppMenu = {
    render: (args) => {
        return (
            <nav>
                <EnvironmentContextProvider
                    environment="storybook"
                    features={{ collections: true, galleries: true, portfolio: true }}
                >
                    <Component {...args} />
                </EnvironmentContextProvider>
            </nav>
        );
    },
};
