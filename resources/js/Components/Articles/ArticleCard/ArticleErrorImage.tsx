import cn from "classnames";
import { ImageLoadError, ImageLoadErrorPrimary } from "@/images";

export const ArticleErrorImage = ({ className }: { className?: string; errorMessage?: string }): JSX.Element => {
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
