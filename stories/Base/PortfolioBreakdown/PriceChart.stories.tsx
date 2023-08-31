import type { Meta, StoryFn } from "@storybook/react";

import { PriceChart as Component } from "@/Components/PortfolioBreakdown";

export default {
    title: "Base/PortfolioBreakdown",
    component: Component,
    argTypes: {
        isPlaceholder: {
            control: "boolean",
            defaultValue: false,
        },
    },
} as Meta<typeof Component>;

const Template: StoryFn<typeof Component> = (args) => <Component {...args} />;

export const PriceChart = Template.bind({});

const values = [4, 5, 2, 2, 2, 3, 5, 1, 4, 5, 6, 5, 3, 3, 4, 5, 6, 4, 4, 4, 5, 8, 8, 10];
PriceChart.args = {
    labels: Object.keys(values),
    values,
};
