import cn from "classnames";
import { useTranslation } from "react-i18next";
import { CarouselControls } from "@/Components/Carousel";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Skeleton } from "@/Components/Skeleton";

export const GallerySkeletonItem = ({ className }: { className?: string }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            <div
                className={cn(
                    "box-content flex flex-col rounded-xl border border-theme-secondary-300",
                    "outline outline-3 outline-transparent dark:border-theme-dark-700",
                )}
            >
                <div className="px-6 pb-3 pt-6">
                    <div className="mb-3 grid aspect-[3/2] grid-cols-3 gap-1">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton
                                className="aspect-square w-full rounded-xl bg-theme-secondary-100"
                                key={index}
                            />
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full" />

                        <Skeleton className="h-4 w-20 rounded-xl" />
                    </div>

                    <div className="mb-1 mt-1.5">
                        <Skeleton className="h-6 w-44" />
                    </div>
                </div>

                <div className="rounded-b-xl bg-theme-secondary-50 px-6 pb-3 font-medium dark:bg-theme-dark-800">
                    <div className="flex justify-between pt-3">
                        <div className="flex flex-col">
                            <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                                {t("pages.galleries.value")}
                            </span>
                            <Skeleton className="h-6 w-20 rounded-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                                {t("pages.galleries.nfts")}
                            </span>
                            <Skeleton className="h-6 w-10 rounded-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                                {t("pages.galleries.collections")}
                            </span>
                            <Skeleton className="h-6 w-10 rounded-xl" />
                        </div>
                    </div>
                    <hr className="my-3 text-theme-secondary-300 dark:text-theme-dark-700" />
                    <div className="flex items-center justify-between text-theme-secondary-700">
                        <div className="flex items-center space-x-2 dark:text-theme-dark-200">
                            <div>
                                <Icon
                                    name="Heart"
                                    size="lg"
                                />
                            </div>
                            <span className="text-sm">
                                <Skeleton className="h-5 w-10 rounded-xl" />
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 dark:text-theme-dark-200">
                            <Icon
                                name="Eye"
                                size="lg"
                            />

                            <span className="text-sm">
                                <Skeleton className="h-5 w-10 rounded-xl" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GallerySkeleton = ({ title, viewAllPath }: { title: string; viewAllPath: string }): JSX.Element => (
    <div className="mx-6 sm:mx-8 2xl:mx-0">
        <div className="mb-3 flex items-center sm:justify-between">
            <Heading
                level={2}
                className="p-0"
            >
                {title}
            </Heading>

            <CarouselControls
                disabled
                title={title}
                viewAllPath={viewAllPath}
            />
        </div>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <GallerySkeletonItem />
            <GallerySkeletonItem className="hidden md:block" />
            <GallerySkeletonItem className="hidden lg:block" />
            <GallerySkeletonItem className="hidden xl:block" />
        </div>
    </div>
);
