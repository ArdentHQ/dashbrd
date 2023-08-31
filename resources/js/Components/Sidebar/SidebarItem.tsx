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
}: SidebarItemProperties): JSX.Element => (
    <Tooltip
        content={tooltip}
        disabled={tooltip === undefined}
    >
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
                        "border-transparent text-theme-hint-600": isSelected,
                    })}
                    name={icon}
                    size="lg"
                />
            )}
            <div>{title}</div>
        </Tabs.Link>
    </Tooltip>
);
