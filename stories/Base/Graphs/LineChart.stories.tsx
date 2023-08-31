import type { Meta, StoryFn } from "@storybook/react";

import { LineChart as Component } from "@/Components/Graphs";

export default {
    title: "Base/Graphs",
    component: Component,
    argTypes: {
        hideGrid: {
            control: "boolean",
            defaultValue: false,
        },

        reference: {
            table: {
                disable: true,
            },
        },
    },
} as Meta<typeof Component>;

const Template: StoryFn<typeof Component> = (args) => <Component {...args} />;

export const LineChart = Template.bind({});

const values = [4, 5, 2, 2, 2, 3, 5, 1, 4, 5, 6, 5, 3, 3, 4, 5, 6, 4, 4, 4, 5, 8, 8, 10];
LineChart.args = {
    data: {
        labels: Object.keys(values),
        datasets: [
            {
                label: "test data",
                borderColor: "rgba(196, 200, 207, 1)",
                data: values,
                pointRadius: 0,
                borderWidth: 2,
                fill: false,
                tension: 0.25,
            },
        ],
    },
};
