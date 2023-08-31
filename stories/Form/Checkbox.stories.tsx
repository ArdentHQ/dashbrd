import { Meta } from "@storybook/react";
import { Checkbox } from "@/Components/Form/Checkbox";
import { useArgs } from "@storybook/preview-api";
import { action } from "@storybook/addon-actions";

export default {
    title: "Form/Checkbox",
    component: Checkbox,
    argTypes: {
        checked: { control: "boolean", defaultValue: false },
        disabled: { control: "boolean", defaultValue: false },
        onChange: { action: "clicked" },
        isInvalid: { control: "boolean", defaultValue: false },
    },
} as Meta<typeof Checkbox>;

export const Default = (args) => {
    const [{ checked }, updateArgs] = useArgs();

    const toggle = () => {
        updateArgs({
            checked: !checked,
        });

        action("onChange")(!checked);
    };

    return (
        <Checkbox
            {...args}
            name="checkbox"
            onChange={toggle}
        />
    );
};

// export const Label = (args) => {
//     const [{ checked }, updateArgs] = useArgs();

//     const toggle = () => {
//         updateArgs({
//             checked: ! checked,
//         });

//         action("onChange")(! checked);
//     };

//     return (
//         <label className="flex items-start space-x-3">
//             <CheckboxComponent
//                 {...args}
//                 name="checkbox"
//                 className="mt-0.5"
//                 onChange={toggle}
//             />

//             <p className="text-theme-secondary-700">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, totam?</p>
//         </label>
//     );
// };
