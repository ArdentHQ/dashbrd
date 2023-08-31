import cn from "classnames";
import { IconButton, type IconButtonProperties } from "@/Components/Buttons/IconButton";
import { type IconName } from "@/Components/Icon";

export const SaveButton = ({
    baseClassName,
    selectedClassName,
    icon = "Bookmark",
    ...properties
}: Omit<IconButtonProperties, "icon"> & {
    icon?: IconName | JSX.Element;
}): JSX.Element => (
    <IconButton
        baseClassName={cn(baseClassName, "button-save")}
        selectedClassName={cn(selectedClassName, "button-save-selected")}
        icon={icon}
        {...properties}
    />
);
