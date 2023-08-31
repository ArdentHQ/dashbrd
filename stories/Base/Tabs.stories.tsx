import type { StoryFn, Meta } from "@storybook/react";

import { Tabs } from "@/Components/Tabs";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

export default {
    title: "Base/Tabs",
    component: Tabs,
} as Meta<typeof Tabs>;

const Story: StoryFn<typeof Tabs> = ({ ...args }) => (
    <Tabs {...args}>
        <Tabs.Button selected>Tab 1</Tabs.Button>
        <Tabs.Button>Tab 2</Tabs.Button>
        <Tabs.Button disabled>Disabled Tab</Tabs.Button>
        <Tabs.Button>Tab 4</Tabs.Button>
    </Tabs>
);
const HeadlessStory: StoryFn<typeof Tabs> = () => (
    <Tab.Group>
        <Tab.List>
            <Tabs>
                <Tab as={Fragment}>{({ selected }) => <Tabs.Button selected={selected}>Tab 1</Tabs.Button>}</Tab>
                <Tab as={Fragment}>{({ selected }) => <Tabs.Button selected={selected}>Tab 2</Tabs.Button>}</Tab>
                <Tab as={Fragment}>{({ selected }) => <Tabs.Button selected={selected}>Tab 3</Tabs.Button>}</Tab>
            </Tabs>
        </Tab.List>
        <Tab.Panels>
            <Tab.Panel>
                <div className="mt-3 rounded-2xl border border-theme-secondary-300 p-4">Content 1</div>
            </Tab.Panel>
            <Tab.Panel>
                <div className="mt-3 rounded-2xl border border-theme-secondary-300 p-4">Content 2</div>
            </Tab.Panel>
            <Tab.Panel>
                <div className="mt-3 rounded-2xl border border-theme-secondary-300 p-4">Content 3</div>
            </Tab.Panel>
        </Tab.Panels>
    </Tab.Group>
);

export const Default = Story.bind({});

export const Functional = HeadlessStory.bind({});
