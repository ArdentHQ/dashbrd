import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import { InputLabel } from "@/Components/Form/InputLabel";
import { TextInput } from "@/Components/Form/TextInput";

export default {
    title: "Form/Labels",
    component: InputLabel,
    argTypes: {
        htmlFor: { control: "text" },
    },
} as Meta<typeof InputLabel>;

const InputTemplate: StoryFn<typeof InputLabel> = (args) => (
    <div>
        <InputLabel
            className="mb-1"
            {...args}
        />
        <TextInput id="email" />
    </div>
);
const Template: StoryFn<typeof InputLabel> = (args) => <InputLabel {...args} />;

export const Default = Template.bind({});
export const TextInputWithLabel = InputTemplate.bind({});

Default.args = {
    value: "E-mail address",
};

TextInputWithLabel.args = {
    value: "E-mail address",
    htmlFor: "email",
};
