import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import { TextInput } from "@/Components/Form/TextInput";
import { InputGroup } from "@/Components/Form/InputGroup";
import { Avatar } from "@/Components/Avatar";

export default {
    title: "Form/TextInput",
    component: TextInput,
    argTypes: {
        id: { control: "text" },
        required: { control: "boolean", defaultValue: false },
        disabled: { control: "boolean", defaultValue: false },
        type: { control: "text" },
        placeholder: { control: "text" },
        value: { control: "text" },
        error: { control: "text" },
        hintPosition: {
            control: "select",
            options: ["left", "right"],
        },
    },
} as Meta<typeof TextInput>;

const Template: StoryFn<typeof TextInput> = ({ error, hint, hintPosition, ...args }) => {
    return (
        <InputGroup
            error={error}
            hint={hint}
            hintPosition={hintPosition}
        >
            {({ hasError }) => (
                <TextInput
                    {...args}
                    hasError={hasError}
                />
            )}
        </InputGroup>
    );
};

export const Default = Template.bind({});

export const Label = ({ error, hint, hintPosition, ...args }) => (
    <div>
        <InputGroup
            label="Your name"
            id={args.id}
            error={error}
            hint={hint}
            hintPosition={hintPosition}
        >
            {({ hasError }) => (
                <TextInput
                    {...args}
                    hasError={hasError}
                />
            )}
        </InputGroup>
    </div>
);

export const OneHint = Template.bind({});
export const TwoHints = Template.bind({});
export const Error = Template.bind({});
export const ErrorAndHint = Template.bind({});
export const AvatarAndButton = ({ error, hint, hintPosition, before, after, ...args }) => (
    <InputGroup
        error={error}
        hint={hint}
        hintPosition={hintPosition}
    >
        {({ hasError }) => (
            <TextInput
                after={after}
                before={before}
                {...args}
                hasError={hasError}
            />
        )}
    </InputGroup>
);
export const TextInputAvatarAvatar = AvatarAndButton.bind({});
export const Button = AvatarAndButton.bind({});

Default.args = {
    id: "email",
    type: "email",
    placeholder: "Enter your e-mail address",
};

Label.args = {
    id: "name",
    type: "name",
    placeholder: "e.g. John Doe",
};

OneHint.args = {
    id: "email",
    type: "email",
    placeholder: "Enter your e-mail address",
    hint: "This is some help text.",
};

TwoHints.args = {
    id: "email",
    type: "email",
    placeholder: "Enter your e-mail address",
    hint: ["This is some help text.", "This is another help text."],
};

Error.args = {
    id: "email",
    type: "email",
    placeholder: "Enter your e-mail address",
    error: "Please enter a valid email address.",
};

ErrorAndHint.args = {
    id: "email",
    type: "email",
    placeholder: "Enter your e-mail address",
    error: "Please enter a valid email address.",
    hint: "This is some hint text.",
};
TextInputAvatarAvatar.args = {
    id: "avatar",
    before: (
        <TextInput.Avatar>
            <Avatar
                address="0x1"
                size={32}
            />
        </TextInput.Avatar>
    ),
};
Button.args = {
    id: "button",
    after: <TextInput.Button>Max</TextInput.Button>,
};
AvatarAndButton.args = {
    id: "avatar-n-button",
    before: (
        <TextInput.Avatar>
            <Avatar
                address="0x1"
                size={32}
            />
        </TextInput.Avatar>
    ),
    after: <TextInput.Button>Max</TextInput.Button>,
};
