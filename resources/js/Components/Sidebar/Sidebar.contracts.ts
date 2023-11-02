import type React from "react";
import { type IconName } from "@/Components/Icon";

export interface SidebarHeadProperties {
    title?: string;
    subtitle?: string;
    className?: string;
}

export interface SidebarProperties extends SidebarHeadProperties {
    children: React.ReactNode;
}

export interface SidebarItemProperties {
    title: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    icon?: IconName;
    href?: string;
    tooltip?: string;
    rightText?: string;
}
