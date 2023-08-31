import cn from "classnames";

interface Properties extends React.InputHTMLAttributes<HTMLInputElement> {
    isInvalid?: boolean;
}

export const Checkbox = ({ className, isInvalid = false, ...properties }: Properties): JSX.Element => (
    <input
        data-testid="Checkbox"
        type="checkbox"
        className={cn(
            "form-checkbox box-border h-5 w-5 rounded border-2 text-theme-hint-600 transition duration-100 ease-in",
            isInvalid
                ? "border-theme-danger-400"
                : "border-theme-secondary-300 enabled:hover:border-theme-hint-400 enabled:checked:hover:border-theme-hint-400",
            "disabled:border-theme-secondary-200 disabled:bg-theme-secondary-100 disabled:checked:border-theme-secondary-100 disabled:hover:bg-theme-secondary-100",
            "focus:ring-0 focus:ring-transparent focus:ring-offset-0",
            "focus-visible:ring-4 focus-visible:ring-theme-hint-300",
            className,
        )}
        {...properties}
    />
);
