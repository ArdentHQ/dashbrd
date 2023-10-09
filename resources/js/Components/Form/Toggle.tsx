import { Switch } from "@headlessui/react";
import cn from "classnames";

interface Properties {
    checked: boolean;
    onChange: (checked: boolean) => void;
    screenReaderLabel?: string;
    className?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
}

export const Toggle = ({
    checked,
    onChange,
    screenReaderLabel,
    className,
    name,
    id,
    disabled = false,
}: Properties): JSX.Element => {
    const defaultLabel = checked ? "Disable" : "Enable";

    return (
        <Switch
            data-testid="Toggle"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            name={name}
            id={id}
            className={cn(
                className,
                "relative inline-flex h-6 w-11 items-center rounded-full transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-primary-300 dark:focus-visible:ring-theme-primary-700",
                disabled
                    ? "bg-theme-secondary-200 dark:bg-theme-dark-700"
                    : [
                          checked
                              ? "bg-theme-primary-600 hover:bg-theme-primary-700 active:bg-theme-primary-800 dark:bg-theme-primary-700 dark:hover:bg-theme-primary-600 dark:focus-visible:bg-theme-primary-400 dark:active:bg-theme-primary-400"
                              : "bg-theme-secondary-200 hover:bg-theme-secondary-300 active:bg-theme-secondary-400 dark:bg-theme-dark-700 dark:focus-within:bg-theme-dark-700 dark:hover:bg-theme-dark-800 dark:active:bg-theme-dark-800",
                      ],
            )}
        >
            <span className="sr-only">{screenReaderLabel ?? defaultLabel}</span>

            <span
                className={cn(
                    "inline-block h-5 w-5 rounded-full shadow-sm transition duration-200 ease-in-out",
                    disabled ? "bg-theme-secondary-400 dark:bg-theme-dark-200" : "bg-white",
                    checked ? "translate-x-[1.375rem]" : "translate-x-0.5",
                )}
            />
        </Switch>
    );
};
