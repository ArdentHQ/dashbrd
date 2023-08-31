import { Meta } from "@storybook/react";
import { Form } from "@/Pages/Settings/Form";
import { Button } from "@/Components/Buttons/Button";

export default {
    title: "Form/Form",
    component: Form,
    argTypes: {
        //
    },
} as Meta<typeof Form>;

export const Default = () => {
    const actions = (): JSX.Element => (
        <>
            <Button type="submit">Submit</Button>
        </>
    );

    return (
        <Form footer={actions()}>
            <Form.Section
                title="First title"
                subtitle="First subtitle"
            >
                This contains an input
            </Form.Section>
        </Form>
    );
};

export const MultipleSections = () => {
    const actions = (): JSX.Element => (
        <>
            <Button
                variant="secondary"
                type="reset"
            >
                Reset
            </Button>
            <Button type="submit">Submit</Button>
        </>
    );

    return (
        <Form footer={actions()}>
            <Form.Section
                title="First title"
                subtitle="First subtitle"
            >
                This contains an input
            </Form.Section>

            <Form.Separator />

            <Form.Section
                title="Second title"
                subtitle="Second subtitle"
            >
                This contains an input
            </Form.Section>
        </Form>
    );
};
