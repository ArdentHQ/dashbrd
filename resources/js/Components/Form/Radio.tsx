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
                "form-radio box-border h-5 w-5 border-2 text-theme-primary-600 transition duration-100 ease-in",
                isInvalid
                    ? "border-theme-danger-400"
                    : "border-theme-secondary-300 enabled:hover:border-theme-primary-400 enabled:checked:hover:border-theme-primary-400",
                "disabled:border-theme-secondary-200 disabled:bg-theme-secondary-100 disabled:checked:border-theme-secondary-100 disabled:hover:bg-theme-secondary-100",
                "focus:ring-0 focus:ring-transparent focus:ring-offset-0",
                "focus-visible:ring-4 focus-visible:ring-theme-primary-300",
                className,
            )}
            {...properties}
        />
    ),
);

Radio.displayName = "Radio";
