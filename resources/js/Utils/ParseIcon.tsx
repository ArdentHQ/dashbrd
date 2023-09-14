import cn from "classnames";
import { type ButtonContentProperties } from "@/Components/Buttons";
import { Icon, type IconName } from "@/Components/Icon";

interface Properties {
    icon: IconName | JSX.Element;
    className?: string;
    size?: ButtonContentProperties["iconSize"];
}

interface IconDimensions {
    className: string;
}

const getDimensions = (size: Properties["size"] = "sm"): IconDimensions => {
    const sizeMap: Record<string, IconDimensions> = {
        "2xs": {
            className: "h-2 w-2",
        },
        xs: {
            className: "h-3 w-3",
        },
        sm: {
            className: "h-4 w-4",
        },
        md: {
            className: "h-5 w-5",
        },
    };

    return sizeMap[size];
};

export const ParseIcon = ({ icon, className, size }: Properties): JSX.Element => {
    if (typeof icon === "string") {
        return (
            <Icon
                name={icon}
                className={cn(className, getDimensions(size).className)}
            />
        );
    }

    return icon;
};
