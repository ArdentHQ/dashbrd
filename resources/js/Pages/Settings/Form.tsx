import cn from "classnames";
import { type HTMLAttributes, type ReactNode } from "react";
import { Heading } from "@/Components/Heading";

interface FormProperties extends HTMLAttributes<HTMLFormElement> {
    footer: ReactNode;
}

interface FormSectionProperties extends HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle: string;
}

const FormRoot = ({ footer, children, className, ...properties }: FormProperties): JSX.Element => (
    <form
        className={cn("border-theme-secondary-300 sm:rounded-xl sm:border", className)}
        {...properties}
    >
        <div className="px-6 py-6 sm:px-8">{children}</div>

        <footer className="flex items-center justify-end space-x-3 border-t border-theme-secondary-300 px-6 py-4 sm:px-8">
            {footer}
        </footer>
    </form>
);

const Section = ({ title, subtitle, children }: FormSectionProperties): JSX.Element => (
    <section className="grid-cols-2 gap-6 lg:grid">
        <div>
            <Heading
                level={4}
                weight="medium"
            >
                {title}
            </Heading>

            <p className="mt-1 text-sm leading-6 text-theme-secondary-700">{subtitle}</p>
        </div>

        <div className="mt-4 lg:mt-0">{children}</div>
    </section>
);

const Separator = (): JSX.Element => <hr className="my-6 text-theme-secondary-300" />;

export const Form = Object.assign(FormRoot, {
    Section,
    Separator,
});
