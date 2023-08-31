import type { Meta } from "@storybook/react";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";

export default {
    title: "Networks/NetworkIcon",
    argTypes: {
        networkId: {
            control: "select",
            options: {
                Polygon: 137,
                Mumbai: 80001,
                Ethereum: 1,
                Goerli: 5,
            },
            defaultValue: 1,
        },
    },
} as Meta<typeof NetworkIcon>;

export const Default = {
    render: ({ networkId }: { networkId: App.Enums.Chains }) => {
        return (
            <div className="h-20 w-20">
                <NetworkIcon networkId={networkId} />
            </div>
        );
    },
};

Default.args = {
    networkId: 137,
};
