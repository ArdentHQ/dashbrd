import cn from "classnames";

interface Properties extends React.LabelHTMLAttributes<HTMLLabelElement> {
    value?: string;
    children?: React.ReactNode;
}

export const InputLabel = ({ value, className, children, ...properties }: Properties): JSX.Element => (
    <label
        data-testid="InputLabel"
        className={cn(
            "block text-sm font-medium leading-6 text-theme-secondary-700 dark:text-theme-dark-200",
            className,
        )}
        {...properties}
    >
        {value ?? children}
    </label>
);
