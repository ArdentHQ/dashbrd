import cn from "classnames";
import { useRef, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import FeaturedCollectionData = App.Data.Articles.FeaturedCollectionData;
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";

export const calculateCircleCount = (totalCount: number, availableWidth: number): number => {
    const circleWidth = 20;
    const overlapWidth = 4;
    const hiddenLabelWidth = 29;

    const maxCirclesCount = Math.floor((availableWidth - overlapWidth) / circleWidth);

    // if all circles or only one circle doesn't fit then return total count
    if (Math.abs(maxCirclesCount - totalCount) <= 1) {
        return totalCount;
    }

    let showCount = maxCirclesCount - 2;

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
export const FeaturedCollections = ({ collections }: { collections: FeaturedCollectionData[] }): JSX.Element => {
    const totalCount = collections.length;

    const [visibleCount, setVisibleCount] = useState(totalCount);
    const container = useRef<HTMLDivElement>(null);

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
                            src={collection.image}
                            isCircle
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                            errorClassName="!p-0"
                        />
                    </div>
                </Tooltip>
            ))}
            <MoreCollectionsLabel
                total={totalCount}
                visible={visibleCount}
            />
        </div>
    );
};

export const MoreCollectionsLabel = ({ total, visible }: { total: number; visible: number }): JSX.Element => {
    if (total - visible > 0) {
        return (
            <span
                data-testid="MoreCollectionsLabel"
                className="z-10 -ml-1 flex h-6 select-none items-center justify-center rounded-full bg-theme-hint-100 px-2 text-xs font-medium text-theme-hint-900 ring-2 ring-white"
            >
                +{total - visible}
            </span>
        );
    }

    return <></>;
};
