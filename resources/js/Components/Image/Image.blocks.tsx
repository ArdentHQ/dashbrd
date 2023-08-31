import cn from "classnames";
import { ImageLoadError } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const ImageErrorPlaceholer = ({
    className,
    errorMessage,
}: {
    className?: string;
    errorMessage?: string;
}): JSX.Element => (
    <div
        data-testid="ImageErrorPlaceholer"
        className={cn("bg-theme-secondary-100 p-4", className)}
    >
        <div className="flex h-full flex-col items-center justify-center">
            <ImageLoadError className="mx-auto max-w-23" />

            {isTruthy(errorMessage) && (
                <div className="mx-auto mt-[0.625rem] max-w-[12rem] text-center text-sm font-medium text-theme-secondary-700">
                    {errorMessage}
                </div>
            )}
        </div>
    </div>
);
