import type { StoryFn, Meta } from "@storybook/react";

import { Skeleton } from "@/Components/Skeleton";

export default {
    title: "Base/Skeleton",
} as Meta<typeof Skeleton>;

const DefaultTemplate: StoryFn<typeof Skeleton> = (args) => {
    return (
        <div>
            <div className="mb-8">
                Use controls to customize. Can also use classnames for sizes instead of width & height props.
            </div>
            <Skeleton {...args} />
        </div>
    );
};

export const Default = DefaultTemplate.bind({
    component: Skeleton,
    argTypes: {
        width: { control: "number", defaultValue: undefined },
        height: { control: "number", defaultValue: undefined },
    },
});

Default.args = {
    isCircle: true,
    width: undefined,
    height: undefined,
    className: "h-8 w-8",
};

export const Circles: StoryFn<typeof Skeleton> = (args) => {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton
                width={200}
                height={200}
                isCircle
            />

            <Skeleton
                width={160}
                height={160}
                isCircle
            />

            <Skeleton
                width={100}
                height={100}
                isCircle
            />
            <Skeleton
                width={80}
                height={80}
                isCircle
            />
            <Skeleton
                width={60}
                height={60}
                isCircle
            />
            <Skeleton
                width={40}
                height={40}
                isCircle
            />
            <Skeleton
                width={20}
                height={20}
                isCircle
            />
        </div>
    );
};

export const Lines: StoryFn<typeof Skeleton> = ({ height }) => {
    return (
        <div className="space-y-4">
            <Skeleton
                width="100%"
                height={height}
            />

            <Skeleton
                width="90%"
                height={height}
            />

            <Skeleton
                width="80%"
                height={height}
            />

            <Skeleton
                width="70%"
                height={height}
            />

            <Skeleton
                width="60%"
                height={height}
            />

            <Skeleton
                width="50%"
                height={height}
            />

            <Skeleton
                width="50%"
                height={height}
            />

            <Skeleton
                width="40%"
                height={height}
            />

            <Skeleton
                width="30%"
                height={height}
            />

            <Skeleton
                width="20%"
                height={height}
            />

            <Skeleton
                width="10%"
                height={height}
            />
        </div>
    );
};
