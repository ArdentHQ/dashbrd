import { Skeleton } from "@/Components/Skeleton";

export const ArticleListItemSkeleton = (): JSX.Element => (
    <div
        data-testid="ArticleListItemSkeleton"
        className="flex space-x-3 border-b-4  border-theme-secondary-100 bg-white p-6 dark:border-theme-dark-700 dark:bg-theme-dark-900 lg:rounded-lg lg:border lg:border-theme-secondary-300"
    >
        <div className="aspect-video h-11 flex-shrink-0 overflow-hidden rounded bg-theme-secondary-300 dark:bg-theme-dark-900 sm:h-16">
            <div className="h-full [&>span]:h-full">
                <Skeleton className="h-full w-full rounded bg-theme-secondary-100" />
            </div>
        </div>

        <div className="flex flex-1 flex-col space-y-2">
            <Skeleton className="h-5 w-2/4 rounded" />
            <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-20 rounded" />
                <span className="block h-[5px] w-[5px] rounded-full bg-theme-secondary-400 dark:bg-theme-dark-500"></span>
                <Skeleton className="salam hidden h-5 w-30 rounded sm:block" />
                <div className="ml-2 flex">
                    <Skeleton className="h-5 w-5 rounded-full ring-2 ring-theme-secondary-50 dark:ring-theme-dark-900" />
                    <Skeleton className="-ml-1 h-5 w-5 rounded-full ring-2 ring-theme-secondary-50 dark:ring-theme-dark-900" />
                    <Skeleton className="-ml-1 h-5 w-5 rounded-full ring-2 ring-theme-secondary-50 dark:ring-theme-dark-900" />
                </div>
            </div>
        </div>
    </div>
);
