import cn from "classnames";
import { useRef, useState } from "react";
import { type ArticleCardCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";
import { useResizeObserver } from "@/Hooks/useResizeObserver";

export const FeaturedCollections = ({ collections }: { collections: ArticleCardCollections }): JSX.Element => {
    const [visibleCount, setVisibleCount] = useState(collections.length);
    const container = useRef<HTMLDivElement>(null);

    const circleWidth = 20;
    const overlapWidth = 4;
    const hiddenLabelWidth = 29;

    const totalCount = collections.length;

    const calculateCircleCount = (): void => {
        const availableWidth = container.current?.clientWidth ?? 0;
        const maxCirclesCount = Math.floor((availableWidth - overlapWidth) / circleWidth);

        const showCount = maxCirclesCount - Math.ceil(hiddenLabelWidth / circleWidth);

        setVisibleCount(totalCount - showCount > 1 ? showCount : totalCount);
    };

    useResizeObserver(container, calculateCircleCount);

    return (
        <div
            className="flex h-6 grow flex-wrap"
            ref={container}
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
                <span className="z-10 -ml-1 flex h-6 select-none items-center justify-center rounded-full bg-theme-hint-100 px-2 text-xs font-medium text-theme-hint-900 ring-2 ring-white">
                    +{totalCount - visibleCount}
                </span>
            )}
        </div>
    );
};
