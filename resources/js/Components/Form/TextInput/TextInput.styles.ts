export const textInputDynamicClassnames = ({
    hasError,
    isFocused,
    isMouseOver,
    isDisabled,
}: {
    hasError: boolean;
    isFocused: boolean;
    isMouseOver: boolean;
    isDisabled: boolean;
}): string[] => {
    const classes = [];

    if (hasError) {
        classes.push("border-theme-danger-400 ring-1 ring-theme-danger-400");
    } else {
        if (isFocused) {
            classes.push("border-theme-primary-600 ring-1 ring-theme-primary-600");
        } else {
            classes.push("border-theme-secondary-400");

            if (isMouseOver && !isDisabled) {
                classes.push("ring-2 ring-theme-primary-100");
            }
        }
    }

    if (isDisabled) {
        classes.push("bg-theme-secondary-50");
    } else {
        classes.push("bg-white");
    }

    return classes;
};
