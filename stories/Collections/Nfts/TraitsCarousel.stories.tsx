import type { Meta } from "@storybook/react";
import { TraitsCarousel } from "@/Pages/Collections/Nfts/Components/TraitsCarousel";

const traits = [
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Background", value: "Blue", nftsPercentage: 16.36 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Feathers", value: "Legendary Brave", nftsPercentage: 0.04 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Headwear", value: "Dancing Flame", nftsPercentage: 1 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Body", value: "Tabby", nftsPercentage: 12 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Eyewear", value: "Gazelles", nftsPercentage: 2 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Outerwear", value: "Diamond Necklace", nftsPercentage: 1.88 },
    { displayType: "DISPLAY_TYPE_PROPERTY", name: "Beak", value: "Small", nftsPercentage: 42.15 },
];

export default {
    title: "Collections/TraitsCarousel",
    argTypes: {
        traits: {
            table: {
                disable: true,
            },
            control: false,
        },
    },
} as Meta<typeof TraitsCarousel>;

export const Default = {
    render: (args) => {
        return <TraitsCarousel traits={args.traits} />;
    },
    traits,
};

Default.args = {
    traits,
};
