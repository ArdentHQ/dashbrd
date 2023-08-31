import React, { ReactElement } from "react";
import cn from "classnames";

interface ColorProps {
    /**
     * Which color to use?
     */
    color?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "hint";
}

// To avoid JIT removing the unused colors
const colors = {
    primary: [
        "bg-theme-primary-50",
        "bg-theme-primary-100",
        "bg-theme-primary-200",
        "bg-theme-primary-300",
        "bg-theme-primary-400",
        "bg-theme-primary-500",
        "bg-theme-primary-600",
        "bg-theme-primary-700",
        "bg-theme-primary-800",
        "bg-theme-primary-900",
    ],
    secondary: [
        "bg-theme-secondary-50",
        "bg-theme-secondary-100",
        "bg-theme-secondary-200",
        "bg-theme-secondary-300",
        "bg-theme-secondary-400",
        "bg-theme-secondary-500",
        "bg-theme-secondary-600",
        "bg-theme-secondary-700",
        "bg-theme-secondary-800",
        "bg-theme-secondary-900",
    ],
    success: [
        "bg-theme-success-50",
        "bg-theme-success-100",
        "bg-theme-success-200",
        "bg-theme-success-300",
        "bg-theme-success-400",
        "bg-theme-success-500",
        "bg-theme-success-600",
        "bg-theme-success-700",
        "bg-theme-success-800",
        "bg-theme-success-900",
    ],
    danger: [
        "bg-theme-danger-50",
        "bg-theme-danger-100",
        "bg-theme-danger-200",
        "bg-theme-danger-300",
        "bg-theme-danger-400",
        "bg-theme-danger-500",
        "bg-theme-danger-600",
        "bg-theme-danger-700",
        "bg-theme-danger-800",
        "bg-theme-danger-900",
    ],
    warning: [
        "bg-theme-warning-50",
        "bg-theme-warning-100",
        "bg-theme-warning-200",
        "bg-theme-warning-300",
        "bg-theme-warning-400",
        "bg-theme-warning-500",
        "bg-theme-warning-600",
        "bg-theme-warning-700",
        "bg-theme-warning-800",
        "bg-theme-warning-900",
    ],
    info: [
        "bg-theme-info-50",
        "bg-theme-info-100",
        "bg-theme-info-200",
        "bg-theme-info-300",
        "bg-theme-info-400",
        "bg-theme-info-500",
        "bg-theme-info-600",
        "bg-theme-info-700",
        "bg-theme-info-800",
        "bg-theme-info-900",
    ],
    hint: [
        "bg-theme-hint-50",
        "bg-theme-hint-100",
        "bg-theme-hint-200",
        "bg-theme-hint-300",
        "bg-theme-hint-400",
        "bg-theme-hint-500",
        "bg-theme-hint-600",
        "bg-theme-hint-700",
        "bg-theme-hint-800",
        "bg-theme-hint-900",
    ],
};

/**
 * Color Palette elements
 */
export const Color = ({ color = "primary", ...props }: ColorProps) => {
    let elements: ReactElement[] = [];
    for (const [colorIndex, colorClass] of colors[color].entries()) {
        const colorNumber = Number(colorClass.split(`bg-theme-${color}-`)[1]);
        elements.push(
            <div
                className="flex w-full items-center space-x-2"
                key={`${color}-${colorNumber}`}
            >
                <div
                    className={cn("storybook-color flex h-12 w-full items-center justify-center", colorClass, {
                        "rounded-l-lg": colorIndex === 0,
                        "rounded-r-lg": colorIndex === colors[color].length - 1,
                    })}
                    {...props}
                >
                    <span
                        className={cn("text-sm", {
                            "text-white": colorNumber >= 500,
                            "text-theme-secondary-900": colorNumber <= 400,
                        })}
                    >
                        {colorNumber}
                    </span>
                </div>
            </div>,
        );
    }
    return (
        <div className="flex flex-col">
            <div className="capitalize text-theme-secondary-700">{color}</div>
            <div className="flex rounded-lg border border-theme-secondary-300 shadow-md">{elements}</div>
        </div>
    );
};
