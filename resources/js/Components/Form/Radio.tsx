import cn from "classnames";
import { forwardRef } from "react";

interface Properties extends React.InputHTMLAttributes<HTMLInputElement> {
    isInvalid?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, Properties>(
    ({ className, isInvalid = false, ...properties }: Properties, reference): JSX.Element => (
        <input
            data-testid="Radio"
            type="radio"
            ref={reference}
            className={cn(
                "dark:form-radio-dark form-radio box-border h-5 w-5 border-2 text-theme-primary-600 transition duration-100 ease-in dark:text-theme-dark-200",
                isInvalid
                    ? "border-theme-danger-400 dark:bg-theme-dark-900"
                    : "border-theme-secondary-300 enabled:hover:border-theme-primary-400 enabled:checked:hover:border-theme-primary-400 dark:border-theme-dark-200 dark:bg-theme-dark-900 dark:enabled:checked:border-theme-primary-400 dark:enabled:checked:bg-theme-primary-400 dark:enabled:hover:border-theme-primary-600 dark:enabled:checked:hover:bg-theme-primary-400",
                "disabled:border-theme-secondary-200 disabled:bg-theme-secondary-100 disabled:checked:border-theme-secondary-100 disabled:hover:bg-theme-secondary-100 dark:disabled:border-theme-dark-400 dark:disabled:bg-theme-dark-700 dark:disabled:checked:border-theme-dark-600 dark:disabled:checked:bg-theme-dark-600",
                "focus:ring-0 focus:ring-transparent focus:ring-offset-0",
                "dark:enabled:focus-within:ring-3 focus-visible:ring-4 focus-visible:ring-theme-primary-300 dark:enabled:focus-within:ring-theme-primary-700",
                className,
            )}
            {...properties}
        />
    ),
);

Radio.displayName = "Radio";
