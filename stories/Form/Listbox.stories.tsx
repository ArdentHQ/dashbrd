import React, { useState } from "react";
import type { Meta } from "@storybook/react";
import { Listbox as ListboxComponent } from "@/Components/Form/Listbox";
import { useArgs } from "@storybook/preview-api";
import { Avatar } from "@/Components/Avatar";
import { InputGroup } from "@/Components/Form/InputGroup";
import { TextInput } from "@/Components/Form/TextInput";
import { Heading } from "@/Components/Heading";

const people = [
    "Wade Cooper",
    "Arlene Mccoy",
    "A very long name loooooooongggg snsdgdsagasdgadsgadsssfdsg asdgdsagdsagdsagdsag adsg",
    "Text",
    "Devon Webb",
    "Tom Cook",
    "Tanya Fox",
    "Hellen Schmidt",
];

export default {
    title: "Form/Listbox",
    component: () => <ListboxComponent />,
    argTypes: {
        placeholder: { control: "text" },
        value: { control: "text" },
        error: { control: "text" },
        hint: { control: "text" },
        hintPosition: {
            control: "select",
            options: ["left", "right"],
        },
        disabled: { control: "boolean" },
        variant: {
            control: "select",
            options: ["primary", "danger"],
        },
    },
} as Meta<typeof ListboxComponent>;

const Template = ({ error, hint, hintPosition, after, className, ...args }) => {
    const [{ value, label }, updateArgs] = useArgs();
    const changeHandler = (value) => updateArgs({ label: value, value: value });

    return (
        <div className="max-w-sm">
            <InputGroup
                error={error}
                hint={hint}
                hintPosition={hintPosition}
            >
                {({ hasError }) => (
                    <ListboxComponent
                        {...args}
                        value={value || ""}
                        label={label}
                        after={after}
                        className={className}
                        onChange={changeHandler}
                        hasError={hasError}
                    />
                )}
            </InputGroup>
        </div>
    );
};

const ListboxGradientTemplate = () => {
    const [value, setValue] = useState("Popular");

    return (
        <div>
            <div className="mb-8">Used in Gallery page.</div>
            <div className="items-center space-x-3 bg-theme-secondary-100 px-6 py-4 xl:flex xl:bg-transparent xl:p-0">
                <div className="hidden xl:block">
                    <Heading level={1}>Galleries:</Heading>
                </div>

                <ListboxComponent
                    value={value}
                    label="Popular"
                    button={
                        <>
                            <div className="hidden xl:block">
                                <ListboxComponent.GradientButton>{value}</ListboxComponent.GradientButton>
                            </div>

                            <div className="block xl:hidden">
                                <ListboxComponent.Button isNavigation>
                                    <span>{value}</span>
                                </ListboxComponent.Button>
                            </div>
                        </>
                    }
                    onChange={(value) => setValue(value)}
                >
                    <ListboxComponent.Option
                        key="Popular"
                        value="Popular"
                        hasGradient
                    >
                        Popular
                    </ListboxComponent.Option>

                    <ListboxComponent.Option
                        key="Newest"
                        value="Newest"
                        hasGradient
                    >
                        Newest
                    </ListboxComponent.Option>

                    <ListboxComponent.Option
                        key="Valuable"
                        value="Valuable"
                        hasGradient
                    >
                        Valuable
                    </ListboxComponent.Option>
                </ListboxComponent>
            </div>
        </div>
    );
};

export const Listbox = Template.bind({});

export const ListboxWithLabel = Template.bind({});

export const ListboxWithIconOptions = Template.bind({});

export const ListboxWithInput = Template.bind({});
export const ListboxWithInputAndButton = Template.bind({});
export const ListboxWithInputDisabled = Template.bind({});
export const ListboxAvatar = Template.bind({});
export const ListboxEmptyAvatar = Template.bind({});
export const ListboxGradient = ListboxGradientTemplate.bind({});

Listbox.args = {
    placeholder: "Select a person",
    children: people.map((person, personIdx) => {
        return (
            <ListboxComponent.Option
                key={personIdx}
                value={person}
            >
                {person}
            </ListboxComponent.Option>
        );
    }),
    onChange: (value: string) => {
        Listbox.args.value = value;
    },
};

ListboxWithIconOptions.args = {
    placeholder: "Select a person",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};

ListboxWithLabel.args = {
    value: people[3],
    label: people[3],
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};

ListboxWithInput.args = {
    value: people[3],
    label: people[3],
    after: <ListboxComponent.Input />,
    maxWith: "150px",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};

ListboxWithInputAndButton.args = {
    value: people[3],
    label: people[3],
    after: <ListboxComponent.Input after={<TextInput.Button>Test</TextInput.Button>} />,
    maxWith: "150px",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};
ListboxWithInputDisabled.args = {
    value: people[3],
    label: people[3],
    after: <ListboxComponent.Input disabled />,
    maxWith: "150px",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};

ListboxAvatar.args = {
    value: people[3],
    label: people[3],
    avatar: ({ variant }) => (
        <ListboxComponent.Avatar variant={variant}>
            <Avatar
                size={32}
                address={`0x4562`}
            />
        </ListboxComponent.Avatar>
    ),
    after: <ListboxComponent.Input />,
    variant: "primary",
    maxWith: "150px",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
};

ListboxEmptyAvatar.args = {
    value: people[3],
    label: people[3],
    variant: "primary",
    avatar: ({ variant }) => <ListboxComponent.Avatar variant={variant} />,
    after: <ListboxComponent.Input />,
    maxWith: "150px",
    children: people.map((person, personIdx) => (
        <ListboxComponent.Option
            key={personIdx}
            value={person}
            icon={
                <Avatar
                    size={24}
                    address={`0x${personIdx.toString()}`}
                />
            }
        >
            {person}
        </ListboxComponent.Option>
    )),
    test: { control: "boolean" },
};
