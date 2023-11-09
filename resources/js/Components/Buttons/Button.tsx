import cn from "classnames";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

import { type IconName } from "@/Components/Icon";
import { isTruthy } from "@/Utils/is-truthy";
import { ParseIcon } from "@/Utils/ParseIcon";

type IconPosition = "left" | "right";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "icon"
    | "icon-primary"
    | "icon-secondary"
    | "bordered"
    | "danger"
    | "icon-danger";

export interface ButtonContentProperties {
    children?: ReactNode;
    icon?: IconName | JSX.Element;
    iconPosition?: IconPosition;
    iconClass?: string;
    variant?: ButtonVariant;
    processing?: boolean;
    iconSize?: "2xs" | "xs" | "sm" | "md";
}

export interface ButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonContentProperties {}

export const parseButtonContent = ({
    children,
    icon,
    iconPosition = "left",
    iconClass,
    iconSize = "sm",
}: ButtonContentProperties): ReactNode => {
    if (icon === undefined) {
        return children;
    }

    const IconComponent = ParseIcon({ icon, className: iconClass, size: iconSize });

    if (children == null) {
        return IconComponent;
    }

    return (
        <div
            data-testid="Button__icon-content"
            className="inline-flex items-center space-x-2"
        >
            {iconPosition === "left" && IconComponent}

            <div>{children}</div>

            {iconPosition === "right" && IconComponent}
        </div>
    );
};

export const getButtonVariantClass = (variant: ButtonVariant): string =>
    ({
        primary: "button-primary",
        secondary: "button-secondary",
        danger: "button-danger",
        icon: "button-icon",
        "icon-primary": "button-icon-primary",
        "icon-secondary": "button-icon-secondary",
        "icon-danger": "button-icon-danger",
        bordered: "button-bordered",
    })[variant];

export const Button = forwardRef<HTMLButtonElement, ButtonProperties>(
    (
        {
            type = "button",
            className,
            variant = "primary",
            children,
            icon,
            iconPosition,
            iconClass,
            iconSize = "sm",
            processing,
            ...properties
        },
        reference,
    ): JSX.Element => {
        const content = parseButtonContent({ children, icon, iconPosition, iconClass, iconSize });

        return (
            <button
                data-testid="Button"
                ref={reference}
                type={type}
                className={cn("group", className, getButtonVariantClass(variant), {
                    "button-with-icon": icon != null && children != null,
                    "opacity-25": isTruthy(processing),
                })}
                {...properties}
            >
                {content}
            </button>
        );
    },
);

Button.displayName = "Button";
