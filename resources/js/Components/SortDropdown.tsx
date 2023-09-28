import cn from "classnames";
import { type ReactElement, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Dropdown } from "@/Components/Dropdown";
import { Tooltip } from "@/Components/Tooltip";

interface Properties {
    disabled?: boolean;
    children: ReactElement;
}

export const SortDropdown = ({ disabled = false, children }: Properties): JSX.Element => {
    const { t } = useTranslation();

    if (disabled) {
        return (
            <IconButton
                icon="FunnelBars"
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
                contentClasses="shadow-3xl flex w-full select-none flex-col overflow-hidden rounded-xl bg-white py-3.5"
            >
                {children}
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
        className={cn(
            "transition-default cursor-pointer whitespace-nowrap px-6 py-2.5 text-left text-base font-medium",
            isActive
                ? "bg-theme-primary-100 text-theme-primary-600"
                : "text-theme-secondary-700 hover:bg-theme-secondary-100 hover:text-theme-secondary-900",
        )}
        onClick={onClick}
    >
        {children}
    </button>
);
