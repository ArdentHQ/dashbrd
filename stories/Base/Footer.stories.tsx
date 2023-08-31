import type { StoryFn, Meta } from "@storybook/react";
import { Footer } from "@/Components/Layout/Footer";

export default {
    title: "Base/Footer",
    component: Footer,
} as Meta<typeof Footer>;

const Template: StoryFn<typeof Footer> = (args) => {
    return <Footer {...args} />;
};

export const FooterTemplate = Template.bind({});

FooterTemplate.args = {};
