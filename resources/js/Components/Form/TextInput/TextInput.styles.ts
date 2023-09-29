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
            classes.push(
                "border-theme-primary-600 ring-1 ring-theme-primary-600 dark:border-theme-primary-400 dark:ring-theme-primary-400",
            );
        } else {
            classes.push("border-theme-secondary-400 dark:border-theme-dark-500");

            if (isMouseOver && !isDisabled) {
                classes.push("ring-2 ring-theme-primary-100 dark:ring-theme-dark-700");
            }
        }
    }

    if (isDisabled) {
        classes.push(
            "bg-theme-secondary-50 dark:border-theme-dark-500 dark:bg-theme-dark-800 dark:text-theme-dark-200",
        );
    } else {
        classes.push("bg-white dark:bg-theme-dark-900");
    }

    return classes;
};
