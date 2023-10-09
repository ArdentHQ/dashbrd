import cn from "classnames";
import { Skeleton } from "@/Components/Skeleton";

export const ArticleCardSkeleton = ({ withImgPlaceholder = true }: { withImgPlaceholder?: boolean }): JSX.Element => (
    <div
        data-testid="ArticleCardSkeleton"
        className="group flex w-full flex-col overflow-hidden rounded-xl border border-theme-secondary-300"
    >
        <div
            className={cn("mx-2 mt-2 aspect-video items-center justify-center overflow-hidden rounded-lg", {
                "flex bg-theme-secondary-100": !withImgPlaceholder,
            })}
        >
            {withImgPlaceholder ? (
                <div className="h-full [&>span]:h-full">
                    <Skeleton className="h-full w-full bg-theme-secondary-100" />
                </div>
            ) : (
                <p className="font-medium text-theme-secondary-500">More Soon</p>
            )}
        </div>

        <div className="flex flex-1 flex-col px-6 py-5">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="my-1 h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
        </div>

        <div className="flex items-center bg-theme-secondary-50 px-6 py-3">
            <Skeleton className="h-5 w-30 rounded" />
            <div className="ml-2 flex">
                <Skeleton className="h-5 w-5 rounded-full ring-2 ring-theme-secondary-50" />
                <Skeleton className="-ml-1 h-5 w-5 rounded-full ring-2 ring-theme-secondary-50" />
                <Skeleton className="-ml-1 h-5 w-5 rounded-full ring-2 ring-theme-secondary-50" />
            </div>
        </div>
    </div>
);
