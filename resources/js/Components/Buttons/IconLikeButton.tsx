import cn from "classnames";
import { IconButton, type IconButtonProperties } from "@/Components/Buttons/IconButton";

export const IconLikeButton = ({
    baseClassName,
    selectedClassName,
    ...properties
}: IconButtonProperties): JSX.Element => (
    <IconButton
        baseClassName={cn(baseClassName, "button-like")}
        selectedClassName={cn(selectedClassName, "button-like-selected")}
        {...properties}
    />
);
