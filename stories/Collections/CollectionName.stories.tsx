import type { Meta } from "@storybook/react";
import { CollectionName } from "@/Components/Collections/CollectionName";

export default {
    title: "Collections/CollectionName",
} as Meta<typeof CollectionName>;

export const Default = {
    render: (args) => <CollectionName {...args} />,
    collection: {
        name: "Mutant Ape Yacht Club",
        image: "",
    },
};

Default.args = {
    collection: {
        name: "Test collection",
        image: "https://i.seadn.io/gae/vw-gp8yUYkQsxQN5xbHrWEhY7rQWQZhIjgO2tvLxu46VY6iwulwWZt5VFS2Q9gy9qJaiJk8QspZs0qaM9z1ODeIyeUUseABOxdfVrC8?auto=format&w=500",
    },
    ownedCount: 4,
    chainImage: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912",
};
