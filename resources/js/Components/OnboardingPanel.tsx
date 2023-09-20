import cn from "classnames";
import { type ComponentProps } from "react";
import { Heading } from "./Heading";
import { Icon } from "./Icon";
import { Monkey } from "@/images";

interface Properties extends ComponentProps<"div"> {
    heading: string;
    subheading: string;
}

export const OnboardingPanel = ({ className, heading, subheading, ...properties }: Properties): JSX.Element => (
    <div
        className={cn("flex flex-col items-center justify-center text-center", className)}
        data-testid="OnboardingPanel"
        {...properties}
    >
        <div className="relative">
            <Icon
                name="SpinnerNarrow"
                className="h-40 w-40 animate-spin text-theme-primary-600"
            />

            <span className="absolute left-8 top-8 flex items-center justify-center">
                <Monkey />
            </span>
        </div>

        <Heading
            className="mt-6"
            level={2}
        >
            {heading}
        </Heading>

        <h3 className="mt-1 text-sm font-medium text-theme-secondary-700">{subheading}</h3>
    </div>
);
