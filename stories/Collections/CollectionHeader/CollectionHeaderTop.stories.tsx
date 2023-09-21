import type { Meta, StoryFn } from "@storybook/react";
import { CollectionHeaderTop } from "@/Components/Collections/CollectionHeader";
import { SampleCollection } from "@/Tests/SampleData";
import EnvironmentContextProvider from "@/Contexts/EnvironmentContext";
import { ActiveUserContextProvider } from "@/Contexts/ActiveUserContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";

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
                <ActiveUserContextProvider initialAuth={{ user, wallet, authenticated: false, signed: false }}>
                    <CollectionHeaderTop
                        collection={args.collection}
                        allowReport={false}
                    />
                </ActiveUserContextProvider>
            </EnvironmentContextProvider>
        );
    },
};

Top.args = {
    collection: SampleCollection,
};
