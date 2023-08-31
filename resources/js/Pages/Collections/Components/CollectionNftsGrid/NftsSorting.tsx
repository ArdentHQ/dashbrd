import cn from "classnames";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Dropdown } from "@/Components/Dropdown";

interface Properties {
    disabled?: boolean;
    activeSort: string | null;
    onSort: (sortBy: string) => void;
}

export const NftsSorting = ({ disabled = false, activeSort, onSort }: Properties): JSX.Element => {
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
                    <IconButton
                        icon="FunnelBars"
                        disabled={disabled}
                    />
                )}
            </Dropdown.Trigger>

            <Dropdown.Content
                className="left-0 right-0 z-10 w-full origin-top-right px-6 sm:left-auto sm:mt-2 sm:h-fit sm:w-48 sm:px-0"
                contentClasses="shadow-3xl flex w-full select-none flex-col overflow-hidden rounded-xl bg-white py-3.5"
            >
                <DropdownButton
                    isActive={activeSort === "id"}
                    onClick={() => {
                        onSort("id");
                    }}
                >
                    {t("pages.collections.sorting.token_number")}
                </DropdownButton>

                <DropdownButton
                    isActive={activeSort === "minted"}
                    onClick={() => {
                        onSort("minted");
                    }}
                >
                    {t("pages.collections.sorting.recently_created")}
                </DropdownButton>
            </Dropdown.Content>
        </Dropdown>
    );
};

const DropdownButton = ({
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
                ? "bg-theme-hint-100 text-theme-hint-600"
                : "text-theme-secondary-700 hover:bg-theme-secondary-100 hover:text-theme-secondary-900",
        )}
        onClick={onClick}
    >
        {children}
    </button>
);
