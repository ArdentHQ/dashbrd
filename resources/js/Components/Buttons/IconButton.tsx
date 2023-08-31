import { Transition } from "@headlessui/react";
import cn from "classnames";
import { forwardRef } from "react";
import { Button, type ButtonProperties } from "@/Components/Buttons/Button";
import { type IconName } from "@/Components/Icon";
import { ParseIcon } from "@/Utils/ParseIcon";

export type IconButtonProperties = ButtonProperties & {
    icon: IconName | JSX.Element;
    variant?: "icon" | "primary" | "secondary" | "danger";
    baseClassName?: string;
    selectedClassName?: string;
    selected?: boolean;
    transitionTo?: IconName | JSX.Element;
    transitionCriteria?: boolean;
};

interface TransitionProperties {
    icon: IconName | JSX.Element;
    iconClass?: string;
    transitionTo: IconName | JSX.Element;
    transitionCriteria: boolean;
}

export const iconTransition = ({
    icon,
    iconClass = "",
    transitionTo,
    transitionCriteria,
}: TransitionProperties): JSX.Element => (
    <>
        <Transition
            show={transitionCriteria}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
            className="absolute m-auto"
        >
            <ParseIcon
                icon={transitionTo}
                className={iconClass}
            />
        </Transition>

        <Transition
            show={!transitionCriteria}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
            className="absolute m-auto"
        >
            <ParseIcon
                icon={icon}
                className={iconClass}
            />
        </Transition>
    </>
);

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProperties>(
    (
        {
            type = "button",
            variant = "icon",
            className,
            baseClassName,
            selectedClassName = "",
            selected = false,
            transitionTo,
            transitionCriteria,
            ...properties
        },
        reference,
    ): JSX.Element => {
        if (transitionTo !== undefined && transitionCriteria !== undefined) {
            properties.icon = iconTransition({
                icon: properties.icon,
                iconClass: properties.iconClass,
                transitionTo,
                transitionCriteria,
            });
        }

        return (
            <Button
                ref={reference}
                data-testid="IconButton"
                type={type}
                className={cn(baseClassName, { [selectedClassName]: selected }, className)}
                variant={variant === "icon" ? variant : `icon-${variant}`}
                {...properties}
            />
        );
    },
);

IconButton.displayName = "IconButton";
