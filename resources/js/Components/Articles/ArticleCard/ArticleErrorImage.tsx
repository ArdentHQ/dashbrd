import cn from "classnames";
import { ImageLoadError, ImageLoadErrorDark, ImageLoadErrorPrimary } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const ArticleErrorImage = ({
    className,
    isLargeVariant,
}: {
    className?: string;
    isLargeVariant?: boolean;
}): JSX.Element => {
    if (isTruthy(isLargeVariant)) {
        return (
            <div
                data-testid="ArticleErrorImage"
                className={cn(
                    "h-full w-full bg-theme-dark-800 p-4 hover:bg-theme-primary-800 dark:bg-theme-primary-800",
                    className,
                )}
            >
                <div className="flex h-full flex-col items-center justify-center">
                    <ImageLoadErrorDark className="mx-auto max-w-23 group-hover:hidden dark:hidden" />
                    <ImageLoadErrorPrimary className="mx-auto hidden max-w-23 group-hover:block dark:block" />
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="ArticleErrorImage"
            className={cn("h-full w-full bg-theme-secondary-100 p-4 dark:bg-theme-primary-800", className)}
        >
            <div className="flex h-full flex-col items-center justify-center">
                <ImageLoadError className="mx-auto max-w-23 dark:hidden" />
                <ImageLoadErrorPrimary className="mx-auto hidden max-w-23 dark:block" />
            </div>
        </div>
    );
};
