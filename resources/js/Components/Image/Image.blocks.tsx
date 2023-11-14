import cn from "classnames";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { ImageLoadError, ImageLoadErrorDark } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const ImageErrorPlaceholder = ({
    className,
    errorMessage,
}: {
    className?: string;
    errorMessage?: string;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();

    return (
        <div
            data-testid="ImageErrorPlaceholer"
            className={cn("bg-theme-secondary-100 p-4 dark:bg-theme-dark-800", className)}
        >
            <div className="flex h-full flex-col items-center justify-center">
                {!isDark && <ImageLoadError className="mx-auto max-w-23" />}
                {isDark && <ImageLoadErrorDark className="mx-auto max-w-23" />}

                {isTruthy(errorMessage) && (
                    <div className="mx-auto mt-[0.625rem] max-w-[12rem] text-center text-sm font-medium text-theme-secondary-700">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};
