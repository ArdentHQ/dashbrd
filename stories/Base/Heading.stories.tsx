import { Heading } from "@/Components/Heading";
import type { StoryFn } from "@storybook/react";

export default {
    title: "Base/Heading",
    argTypes: {
        weight: {
            control: "select",
            options: ["bold", "medium", "normal"],
            defaultValue: "medium",
        },
    },
};

const Template: StoryFn<typeof Heading> = (args) => (
    <div className="space-y-10">
        <Heading
            level={1}
            weight={args.weight}
        >
            This is h1 heading
        </Heading>

        <Heading
            level={2}
            weight={args.weight}
        >
            This is h2 heading
        </Heading>

        <Heading
            level={3}
            weight={args.weight}
        >
            This is h3 heading
        </Heading>

        <Heading
            level={4}
            weight={args.weight}
        >
            This is h4 heading
        </Heading>

        <Heading
            level={4}
            weight={args.weight}
            className="rounded-xl bg-theme-secondary-100 px-4 py-3"
        >
            This is h4 heading with additional props (className)
        </Heading>
    </div>
);

export const Default = Template.bind({});

Default.args = {};
