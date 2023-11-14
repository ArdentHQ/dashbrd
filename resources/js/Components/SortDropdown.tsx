import cn from "classnames";
import { type ReactElement, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Dropdown } from "@/Components/Dropdown";
import { Tooltip } from "@/Components/Tooltip";

interface Properties {
    disabled?: boolean;
    children: ReactElement | (({ setOpen }: { setOpen: (open: boolean) => void }) => JSX.Element | JSX.Element[]);
}

export const SortDropdown = ({ disabled = false, children }: Properties): JSX.Element => {
    const { t } = useTranslation();

    if (disabled) {
        return (
            <IconButton
                icon="FunnelBars"
                data-testid="SortDropdown_Disabled"
                disabled={disabled}
            />
        );
    }

    return (
        <Dropdown
            relative={false}
            className="sm:relative"
        >
            <Dropdown.Trigger className="flex">
                {() => (
                    <Tooltip content={t("common.sort")}>
                        <IconButton
                            icon="FunnelBars"
                            data-testid="SortDropdown"
                            disabled={disabled}
                        />
                    </Tooltip>
                )}
            </Dropdown.Trigger>

            <Dropdown.Content
                className="left-0 right-0 z-10 w-full origin-top-right px-6 sm:left-auto sm:mt-2 sm:h-fit sm:w-48 sm:px-0"
                contentClasses="shadow-3xl flex w-full select-none flex-col overflow-hidden rounded-xl bg-white py-3.5 dark:bg-theme-dark-900 dark:border dark:border-theme-dark-700"
            >
                {({ setOpen }) => (typeof children === "function" ? children({ setOpen }) : children)}
            </Dropdown.Content>
        </Dropdown>
    );
};

export const DropdownButton = ({
    onClick,
    isActive,
    children,
}: {
    onClick: () => void;
    isActive: boolean;
    children: ReactNode;
}): JSX.Element => (
    <button
        data-testid="DropdownButton"
        className={cn(
            "transition-default cursor-pointer whitespace-nowrap px-6 py-2.5 text-left text-base font-medium",
            isActive
                ? "bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-primary-600 dark:text-theme-dark-50"
                : "text-theme-secondary-700 hover:bg-theme-secondary-100 hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50",
        )}
        onClick={onClick}
    >
        {children}
    </button>
);
