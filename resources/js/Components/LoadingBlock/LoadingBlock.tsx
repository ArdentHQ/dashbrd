import cn from "classnames";
import { Icon } from "@/Components/Icon";

export const LoadingBlock = ({ text, className }: { text?: string; className?: string }): JSX.Element => (
    <div
        data-testid="LoadingBlock"
        className={cn(
            "rounded-xl border border-theme-secondary-300 p-4 text-center font-medium text-theme-secondary-900 dark:border-theme-dark-700 dark:text-theme-dark-50",
            className,
        )}
    >
        <div className="flex items-center justify-center space-x-3">
            <Icon
                size="xl"
                name="Spinner"
                className="animate-spin text-theme-primary-600 dark:text-theme-primary-400"
            />
            <div>{text}</div>
        </div>
    </div>
);
