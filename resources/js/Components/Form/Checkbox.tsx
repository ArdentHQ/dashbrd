import cn from "classnames";

interface Properties extends React.InputHTMLAttributes<HTMLInputElement> {
    isInvalid?: boolean;
}

export const Checkbox = ({ className, isInvalid = false, ...properties }: Properties): JSX.Element => (
    <input
        data-testid="Checkbox"
        type="checkbox"
        className={cn(
            "dark:form-checkbox-dark form-checkbox box-border h-5 w-5 rounded border-2 text-theme-primary-600 transition duration-100 ease-in",
            isInvalid
                ? "border-theme-danger-400"
                : "border-theme-secondary-300 enabled:hover:border-theme-primary-400 enabled:checked:hover:border-theme-primary-400 dark:enabled:border-theme-dark-200 dark:enabled:bg-theme-dark-900 dark:enabled:checked:border-theme-primary-400 dark:enabled:checked:bg-theme-primary-400 dark:enabled:hover:border-theme-primary-600 dark:enabled:hover:bg-theme-dark-900 dark:enabled:checked:hover:border-theme-primary-600 dark:enabled:checked:hover:bg-theme-primary-600",
            "disabled:border-theme-secondary-200 disabled:bg-theme-secondary-100 disabled:checked:border-theme-secondary-100 disabled:hover:bg-theme-secondary-100 dark:disabled:border-theme-dark-400 dark:disabled:bg-theme-dark-700 dark:disabled:checked:border-theme-dark-600 dark:disabled:checked:bg-theme-dark-600",
            "focus:ring-0 focus:ring-transparent focus:ring-offset-0",
            "focus-visible:ring-4 focus-visible:ring-theme-primary-300 dark:focus-visible:ring-theme-primary-700",
            className,
        )}
        {...properties}
    />
);
