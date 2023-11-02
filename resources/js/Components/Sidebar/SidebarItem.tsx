import cn from "classnames";
import { type SidebarItemProperties } from "./Sidebar.contracts";
import { Icon } from "@/Components/Icon";
import { Tabs } from "@/Components/Tabs";
import { Tooltip } from "@/Components/Tooltip";
import { isTruthy } from "@/Utils/is-truthy";

export const SidebarItem = ({
    title,
    icon,
    isSelected = false,
    isDisabled = false,
    href,
    tooltip,
    rightText,
}: SidebarItemProperties): JSX.Element => (
    <Tooltip
        content={tooltip}
        disabled={tooltip === undefined}
    >
        {isDisabled || href === undefined ? (
            <Tabs.DisabledLink
                tabIndex={0}
                title={title}
                selected={isSelected}
                disabled={isDisabled}
                data-testid="SidebarItem__disabled"
            >
                {isTruthy(icon) && (
                    <Icon
                        className={cn("transition-default ml-0 mr-2", {
                            "border-transparent text-theme-primary-600 dark:text-theme-dark-50": isSelected,
                        })}
                        name={icon}
                        size="lg"
                    />
                )}

                <span>{title}</span>

                {rightText !== undefined && (
                    <span
                        className={cn("ml-auto text-theme-secondary-500")}
                    >
                        {rightText}
                    </span>
                )}
            </Tabs.DisabledLink>
        ) : (
            <Tabs.Link
                tabIndex={0}
                title={title}
                selected={isSelected}
                disabled={isDisabled}
                href={href}
                data-testid="SidebarItem"
            >
                {isTruthy(icon) && (
                    <Icon
                        className={cn("transition-default ml-0 mr-2", {
                            "border-transparent text-theme-primary-600 dark:text-theme-dark-50": isSelected,
                        })}
                        name={icon}
                        size="lg"
                    />
                )}

                <span>{title}</span>

                {rightText !== undefined && (
                    <span
                        className={cn("ml-auto text-theme-secondary-700", {
                            "dark:text-theme-dark-100": isSelected,
                            "dark:text-theme-dark-200": !isSelected,
                        })}
                    >
                        {rightText}
                    </span>
                )}
            </Tabs.Link>
        )}
    </Tooltip>
);
