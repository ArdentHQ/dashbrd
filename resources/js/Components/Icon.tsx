import React, { type ElementType } from "react";

import { SvgCollection } from "@/icons";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type IconName = keyof typeof SvgCollection;

interface IconProperties extends React.HTMLAttributes<SVGElement> {
    name: IconName;
    size?: Size;
    as?: ElementType;
    fallback?: JSX.Element;
    dimensions?: IconDimensions;
    className?: string;
}

export interface IconDimensions {
    width: number;
    height: number;
}

const getDimensions = (size?: Size, dimensions?: IconDimensions): IconDimensions => {
    if (dimensions !== undefined) {
        return dimensions;
    }

    const sizeMap: Record<string, IconDimensions> = {
        "2xl": {
            width: 40,
            height: 40,
        },
        xl: {
            width: 32,
            height: 32,
        },
        lg: {
            width: 20,
            height: 20,
        },
        md: {
            width: 16,
            height: 16,
        },
        sm: {
            width: 12,
            height: 12,
        },
        xs: {
            width: 8,
            height: 8,
        },
    };

    return sizeMap[size ?? "md"];
};

export const Icon = ({ name, size, dimensions, ...properties }: IconProperties): JSX.Element => {
    const Svg = SvgCollection[name];

    dimensions = getDimensions(size, dimensions);

    return (
        <Svg
            data-testid={`icon-${name}`}
            width={dimensions.width}
            height={dimensions.height}
            {...properties}
        />
    );
};
