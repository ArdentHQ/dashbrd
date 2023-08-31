import type { Meta } from "@storybook/react";
import { Radio } from "@/Components/Form/Radio";
import { useArgs } from "@storybook/preview-api";
import { action } from "@storybook/addon-actions";
import { ChangeEventHandler } from "react";

export default {
    title: "Form/Radio",
    component: Radio,
    argTypes: {
        value: { control: "select", options: ["first", "second", "third"], defaultValue: "first" },
        disabled: { control: "boolean", defaultValue: false },
        isInvalid: { control: "boolean", defaultValue: false },
        onChange: { action: "clicked" },
    },
} as Meta<typeof Radio>;

export const Default = (args) => {
    const [_args, updateArgs] = useArgs();

    return (
        <Radio
            {...args}
            name="testDefault"
            value="testDefault"
            checked={args.value}
            onChange={(event: ChangeEventHandler<HTMLInputElement>, value: string) => {
                updateArgs({
                    value,
                });
                action("onChange")(event);
            }}
        />
    );
};

Default.argTypes = {
    value: { control: false },
};

Default.args = {
    value: false,
    disabled: false,
    isInvalid: false,
};

export const Multiple = (args) => {
    const [_args, updateArgs] = useArgs();

    const setChecked = (event: ChangeEventHandler<HTMLInputElement>, value: string) => {
        updateArgs({
            value,
        });

        action("onChange")(event);
    };

    return (
        <div className="space-y-3">
            {["first", "second", "third"].map((value) => {
                return (
                    <label
                        className="flex items-center space-x-3"
                        key={value}
                    >
                        <Radio
                            {...args}
                            name="testMultiple"
                            value={value}
                            checked={value === args.value}
                            onChange={(event) => setChecked(event, value)}
                        />

                        <p className="text-theme-secondary-700">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, labore.
                        </p>
                    </label>
                );
            })}
        </div>
    );
};
