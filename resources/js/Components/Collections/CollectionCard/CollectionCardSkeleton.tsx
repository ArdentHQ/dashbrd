import { useTranslation } from "react-i18next";
import { Skeleton } from "@/Components/Skeleton";

export const CollectionCardSkeleton = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="CollectionCard"
            className="transition-default relative flex flex-col rounded-xl border border-theme-secondary-300 p-8 outline outline-3 outline-transparent hover:outline-theme-hint-100 focus-visible:outline-theme-hint-300"
        >
            <div className="aspect-[3/2] w-full rounded-lg">
                <div
                    className="grid grid-cols-3 gap-2"
                    data-testid="CollectionCoverImages"
                >
                    <div className="col-span-2 row-span-2">
                        <Skeleton className="aspect-square h-full w-full shrink-0 rounded-xl object-cover" />
                    </div>

                    <>
                        <Skeleton className="aspect-square rounded-xl object-cover" />

                        <div className="relative overflow-hidden rounded-lg">
                            <Skeleton className="aspect-square rounded-xl object-cover" />
                        </div>
                    </>
                </div>
            </div>

            <div className="relative mx-auto -mt-11 flex items-center justify-center">
                <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full">
                    <Skeleton
                        isCircle
                        className="h-20 w-20 ring ring-white"
                    />
                </div>

                <div className="absolute left-[3.875rem] top-[3.875rem] h-5 w-5 rounded-full ring-4 ring-white">
                    <Skeleton
                        isCircle
                        className="h-5 w-5"
                    />
                </div>
            </div>

            <span className="mx-auto mt-1 max-w-full">
                <Skeleton className="my-1 h-5 w-28" />
            </span>

            <div className="mt-3 flex">
                <div className="flex flex-1 justify-end">
                    <div className="ml-auto flex flex-col space-y-0.5 font-medium">
                        <span className="whitespace-nowrap text-sm leading-5.5 text-theme-secondary-500">
                            {t("pages.collections.floor_price")}
                        </span>

                        <Skeleton className="my-1 h-4 w-16" />
                    </div>
                </div>

                <div className="mx-6 border-l border-theme-secondary-300" />

                <div className="flex flex-1 flex-col font-medium">
                    <div className="mr-auto flex flex-col space-y-0.5 font-medium">
                        <span className="whitespace-nowrap text-sm leading-5.5 text-theme-secondary-500">
                            {t("pages.collections.value")}
                        </span>

                        <Skeleton className="my-1 h-4 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
};
