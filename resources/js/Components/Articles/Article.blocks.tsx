import cn from "classnames";
import { useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import FeaturedCollectionData = App.Data.Articles.FeaturedCollectionData;
import { type ArticleCardVariant } from "@/Components/Articles/ArticleCard";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";

export const calculateCircleCount = (totalCount: number, availableWidth: number): number => {
    const circleWidth = 20;
    const overlapWidth = 4;
    const hiddenLabelWidth = 29;

    const maxCirclesCount = Math.floor((availableWidth - overlapWidth) / circleWidth);

    // if all circles fit or only one circle doesn't fit then return total count
    if (Math.abs(maxCirclesCount - totalCount) <= 1) {
        return totalCount;
    }

    let showCount = maxCirclesCount - 2;

    // if there is no enough space show only 1 collection
    if (showCount < 1) {
        return 1;
    }

    const remainingWidth = availableWidth - (showCount * circleWidth + overlapWidth + hiddenLabelWidth);

    // check whether we can fit one more circle in the available width
    if (remainingWidth > circleWidth) {
        showCount++;
    }

    return showCount;
};

// Note: This component uses width to detect number of collections to display, so the parent must have fix width
// (or flex-1 to take the available with) otherwise you may experience infinite loop due to `setVisibleCount` call
export const FeaturedCollections = ({
    collections,
    variant,
}: {
    collections: FeaturedCollectionData[];
    variant?: ArticleCardVariant;
}): JSX.Element => {
    const totalCount = collections.length;

    const [visibleCount, setVisibleCount] = useState(totalCount);
    const container = useRef<HTMLDivElement>(null);

    const isLargeVariant = variant === "large";

    useResizeDetector<HTMLDivElement>({
        handleHeight: false,
        onResize: () => {
            /* istanbul ignore next -- @preserve */
            setVisibleCount(calculateCircleCount(totalCount, container.current?.getBoundingClientRect().width ?? 30));
        },
        targetRef: container,
    });

    return (
        <div
            className="flex max-h-6 w-full flex-1 grow flex-wrap overflow-hidden"
            ref={container}
            id="FeaturedCollections"
            data-testid="FeaturedCollections"
        >
            {collections.slice(0, visibleCount).map((collection, index) => (
                <Tooltip
                    content={collection.name}
                    key={index}
                >
                    <div className={cn("mb-1 flex items-center", { "-ml-1": index > 0 })}>
                        <Img
                            wrapperClassName="h-6 w-6 aspect-square"
                            src={collection.image}
                            isCircle
                            wrapperClassName="h-6 w-6"
                            className={cn("rounded-full ring-2", {
                                "bg-white ring-white dark:bg-theme-dark-800 dark:ring-theme-dark-800": !isLargeVariant,
                                "skeleton-primary bg-theme-dark-900 ring-theme-dark-900 dark:bg-theme-primary-800 dark:ring-theme-primary-800":
                                    isLargeVariant,
                            })}
                            errorClassName="!p-0"
                        />
                    </div>
                </Tooltip>
            ))}
            <MoreCollectionsLabel
                total={totalCount}
                visible={visibleCount}
                variant={variant}
            />
        </div>
    );
};

export const MoreCollectionsLabel = ({
    total,
    visible,
    variant,
}: {
    total: number;
    visible: number;
    variant?: ArticleCardVariant;
}): JSX.Element => {
    const isLargeVariant = variant === "large";

    if (total - visible > 0) {
        return (
            <span
                data-testid="MoreCollectionsLabel"
                className={cn(
                    "z-10 -ml-1 flex h-6 select-none items-center justify-center rounded-full  px-2 text-xs font-medium ring-2 ",
                    {
                        "bg-theme-hint-100 text-theme-hint-900 ring-white dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:ring-theme-dark-800":
                            !isLargeVariant,
                        "bg-theme-secondary-800 text-white ring-theme-dark-900 dark:bg-theme-primary-100 dark:text-theme-dark-300 dark:ring-theme-primary-800":
                            isLargeVariant,
                    },
                )}
            >
                +{total - visible}
            </span>
        );
    }

    return <></>;
};
