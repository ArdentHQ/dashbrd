import type { Meta, StoryFn } from "@storybook/react";
import { CollectionHeaderBottom } from "@/Components/Collections/CollectionHeader";
import { SampleToken } from "@/Tests/SampleData";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import { AuthContextProvider } from "@/Contexts/AuthContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";

export default {
    title: "Collections/Header",
} as Meta<typeof CollectionHeaderBottom>;

const wallet = new WalletFactory().create();
const user = new UserDataFactory().create();

export const Bottom = {
    render: (args) => {
        return (
            <AuthContextProvider initialAuth={{ user, wallet, authenticated: false, signed: false }}>
                <CollectionHeaderBottom {...args} />
            </AuthContextProvider>
        );
    },
};

Bottom.args = {
    collection: new CollectionDetailDataFactory().create(),
    token: SampleToken,
};
