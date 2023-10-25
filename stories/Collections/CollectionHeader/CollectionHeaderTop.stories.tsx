import type { Meta, StoryFn } from "@storybook/react";
import { CollectionHeaderTop } from "@/Components/Collections/CollectionHeader";
import { SampleCollection } from "@/Tests/SampleData";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { AuthContextProvider } from "@/Contexts/AuthContext";

export default {
    title: "Collections/Header",
} as Meta<typeof CollectionHeaderTop>;

const wallet = new WalletFactory().create();
const user = new UserDataFactory().create();

export const Top = {
    render: (args) => {
        return (
            <EnvironmentContextProvider
                environment="storybook"
                features={{ collections: true, galleries: true, portfolio: true }}
            >
                <AuthContextProvider initialAuth={{ user, wallet, authenticated: false, signed: false }}>
                    <CollectionHeaderTop
                        collection={args.collection}
                        allowReport={false}
                    />
                </AuthContextProvider>
            </EnvironmentContextProvider>
        );
    },
};

Top.args = {
    collection: SampleCollection,
};
