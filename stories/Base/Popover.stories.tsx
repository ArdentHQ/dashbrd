import type { StoryFn, Meta } from "@storybook/react";
import { Popover } from "@/Components/Popover";
import { Icon } from "@/Components/Icon";
export default {
    title: "Base/Popover",
    component: Popover,
    argTypes: {},
} as Meta<typeof Popover>;

const Template: StoryFn<typeof Popover> = (args) => (
    <div className="mt-20 flex h-full w-full items-center justify-center">
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className="outline-none">
                        <button type="button">Click me</button>
                    </Popover.Button>

                    <Popover.Transition show={open}>
                        <Popover.Panel className={() => "lalal"}>
                            <div className="flex flex-col pb-6">
                                <span className="text-sm font-medium text-theme-secondary-500">Your Balance</span>
                                <span className="text-2xl font-medium text-theme-secondary-900">$34,253.75</span>
                            </div>
                            <div className="-mx-8 -mb-8 flex flex-col space-y-2 rounded-b-3xl bg-theme-secondary-50 p-8">
                                <button
                                    type="button"
                                    className="flex items-center space-x-2 font-medium text-theme-secondary-700"
                                >
                                    <Icon name="Bell" /> <span>Option 1</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center space-x-2 font-medium text-theme-secondary-700"
                                >
                                    <Icon name="Heart" /> <span>Option 2</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center space-x-2 font-medium text-theme-secondary-700"
                                >
                                    <Icon name="Clock" /> <span>Option 3</span>
                                </button>
                            </div>
                        </Popover.Panel>
                    </Popover.Transition>
                </>
            )}
        </Popover>
    </div>
);

export const Default = Template.bind({});

Default.args = {};
