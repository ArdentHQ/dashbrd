import type { Meta, StoryFn } from "@storybook/react";

import { DonutGraph as Component } from "@/Components/Graphs/DonutGraph/DonutGraph";

export default {
    title: "Base/Graphs",
    component: Component,
} as Meta<typeof Component>;

const Template: StoryFn<typeof Component> = (args) => <Component {...args} />;

export const Donut = Template.bind({});

Donut.args = {
    children: <div>Balance</div>,
    renderTooltip: (dataPoint) => <div>{dataPoint.data.label}</div>,
    size: 280,
    data: [
        {
            value: 100,
            data: {
                label: "other",
            },
        },
    ],
};
