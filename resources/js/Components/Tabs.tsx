import cn from "classnames";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type HTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

interface TabAnchorProperties extends AnchorHTMLAttributes<HTMLAnchorElement> {
    disabled?: boolean;
    selected?: boolean;
}
interface TabButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
    icon?: IconName;
}

const getTabClasses = ({
    variant,
    disabled = false,
    selected,
    className,
}: {
    variant: "horizontal" | "vertical" | "icon";
    disabled?: boolean;
    selected: boolean;
    className?: string;
}): string => {
    const baseClassName = cn(
        "transition-default flex items-center font-medium whitespace-nowrap outline-none outline-3 focus-visible:outline-theme-primary-300 dark:focus-visible:outline-theme-primary-700",
        {
            "cursor-pointer": !disabled,
            "cursor-not-allowed text-theme-secondary-500": disabled,
            "text-theme-secondary-700": !selected && !disabled,
        },
    );

    if (variant === "icon") {
        return cn(
            baseClassName,
            "grow sm:grow-0 justify-center select-none rounded-full w-10 h-10 flex items-center justify-center text-sm -outline-offset-[3px]",
            {
                "border-transparent bg-white text-theme-secondary-900 shadow-sm dark:bg-theme-dark-800 dark:text-theme-dark-50":
                    selected,
                "active:bg-theme-secondary-200 hover:bg-theme-secondary-300 dark:hover:bg-theme-dark-900 dark:hover:text-theme-dark-200":
                    !selected && !disabled,
                "cursor-not-allowed focus:bg-transparent active:bg-transparent dark:text-theme-dark-400": disabled,
            },
            className,
        );
    }
    if (variant === "horizontal") {
        return cn(
            baseClassName,
            "grow sm:grow-0 justify-center select-none rounded-full px-4 h-8 text-sm -outline-offset-[3px]",
            {
                "border-transparent bg-white text-theme-secondary-900 shadow-sm dark:bg-theme-dark-800 dark:text-theme-dark-50":
                    selected,
                "active:bg-theme-secondary-200 hover:bg-theme-secondary-300 dark:hover:bg-theme-dark-900":
                    !selected && !disabled,
                "cursor-not-allowed focus:bg-transparent active:bg-transparent dark:text-theme-dark-400": disabled,
            },
            className,
        );
    }

    return cn(
        baseClassName,
        "rounded-xl sm:py-2.5 sm:px-3 outline-offset-0",
        {
            "bg-theme-primary-100 dark:bg-theme-primary-600 dark:text-theme-dark-50": selected,
            "hover:bg-theme-secondary-100 hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:hover:bg-theme-dark-800 dark:hover:text-theme-dark-50":
                !selected && !disabled,
            "dark:text-theme-dark-400": disabled,
        },
        className,
    );
};

const Link = forwardRef<HTMLAnchorElement, TabAnchorProperties>(
    ({ className, disabled = false, selected = false, ...properties }, reference): JSX.Element => (
        <a
            ref={reference}
            {...properties}
            className={getTabClasses({ variant: "vertical", disabled, selected, className })}
        />
    ),
);
Link.displayName = "Tabs.Link";

const Button = forwardRef<HTMLButtonElement, TabButtonProperties>(
    ({ className, disabled, selected = false, children, icon, ...properties }, reference): JSX.Element => (
        <button
            type="button"
            ref={reference}
            {...properties}
            disabled={disabled}
            className={getTabClasses({
                disabled,
                selected,
                className,
                variant: icon !== undefined ? "icon" : "horizontal",
            })}
        >
            {icon !== undefined ? <Icon name={icon} /> : children}
        </button>
    ),
);
Button.displayName = "Tabs.Button";

interface WrapperProperties extends HTMLAttributes<HTMLDivElement> {
    selected?: boolean;
    disabled?: boolean;
}

export const List = ({ className, ...properties }: WrapperProperties): JSX.Element => (
    <div className="overflow-x-auto">
        <div
            className={cn(
                "inline-flex w-full max-w-full rounded-full bg-theme-secondary-100 p-1 dark:bg-theme-dark-950 sm:w-auto",
                className,
            )}
            {...properties}
        />
    </div>
);

export const Tabs = Object.assign(List, { Button, Link });
