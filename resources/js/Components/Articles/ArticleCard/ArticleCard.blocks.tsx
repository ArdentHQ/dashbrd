import cn from "classnames";
import { useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { type ArticleCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";

export const calculateCircleCount = (totalCount: number, availableWidth: number): number => {
    const circleWidth = 20;
    const overlapWidth = 4;
    const hiddenLabelWidth = 29;

    const maxCirclesCount = Math.floor((availableWidth - overlapWidth) / circleWidth);

    const showCount = maxCirclesCount - Math.ceil(hiddenLabelWidth / circleWidth);

    if (maxCirclesCount === totalCount || showCount < 0) {
        return totalCount;
    }

    return totalCount - showCount > 1 ? showCount : totalCount;
};

// Note: This component uses width to detect number of collections to display, so the parent must have fix width
// (or flex-1 to take the available with) otherwise you may experience infinite loop due to `setVisibleCount` call
export const FeaturedCollections = ({ collections }: { collections: ArticleCollections }): JSX.Element => {
    const totalCount = collections.length;

    const [visibleCount, setVisibleCount] = useState(totalCount);
    const container = useRef<HTMLDivElement>(null);

    useResizeDetector<HTMLDivElement>({
        handleHeight: false,
        onResize: () => {
            /* istanbul ignore next -- @preserve */
            setVisibleCount(calculateCircleCount(totalCount, container.current?.clientWidth ?? 30));
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
                    <div className={cn("flex items-center", { "-ml-1": index > 0 })}>
                        <Img
                            src={collection.image}
                            isCircle
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            errorClassName="!p-0"
                        />
                    </div>
                </Tooltip>
            ))}
            {totalCount - visibleCount > 0 && (
                <span
                    data-testid="FeaturedCollections_Hidden"
                    className="z-10 -ml-1 flex h-6 select-none items-center justify-center rounded-full bg-theme-hint-100 px-2 text-xs font-medium text-theme-hint-900 ring-2 ring-white"
                >
                    +{totalCount - visibleCount}
                </span>
            )}
        </div>
    );
};
