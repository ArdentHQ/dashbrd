import cn from "classnames";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { ImageLoadError, ImageLoadErrorPrimary } from "@/images";

export const ArticleErrorImage = ({ className }: { className?: string; errorMessage?: string }): JSX.Element => {
    const { isDark } = useDarkModeContext();
    return (
        <div
            data-testid="ArticleErrorImage"
            className={cn("h-full w-full bg-theme-secondary-100 p-4 dark:bg-theme-primary-800", className)}
        >
            <div className="flex h-full flex-col items-center justify-center">
                {!isDark && <ImageLoadError className="mx-auto max-w-23" />}
                {isDark && <ImageLoadErrorPrimary className="mx-auto max-w-23" />}
            </div>
        </div>
    );
};
