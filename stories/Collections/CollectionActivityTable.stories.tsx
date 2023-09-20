import type { Meta } from "@storybook/react";
import { CollectionActivityTable } from "@/Components/Collections/CollectionActivityTable";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import NftActivitiesDataFactory from "@/Tests/Factories/Nfts/NftActivitiesDataFactory";
import { ActiveUserContextProvider } from "@/Contexts/ActiveUserContext";

const collection = new CollectionDetailDataFactory().create();
const activities = new NftActivitiesDataFactory().create();

export default {
    title: "Collections/CollectionActivityTable",
    argTypes: {
        isLoading: {
            control: "boolean",
            defaultValue: false,
        },
        showNameColumn: {
            control: "boolean",
            defaultValue: false,
        },
        collection: {
            table: {
                disable: true,
            },
            control: false,
        },
        activities: {
            table: {
                disable: true,
            },
            control: false,
        },
    },
} as Meta<typeof CollectionActivityTable>;

export const Default = {
    render: (args) => {
        return (
            <ActiveUserContextProvider
                initialAuth={{ user: { attributes: {} }, wallet: null, authenticated: false, signed: false }}
            >
                <CollectionActivityTable {...args} />
            </ActiveUserContextProvider>
        );
    },
    collection,
    activities,
};

Default.args = {
    collection,
    activities,
    isLoading: false,
    showNameColumn: false,
};
