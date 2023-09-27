import cn from "classnames";
import { useRef, useState } from "react";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";
import { useResizeObserver } from "@/Hooks/useResizeObserver";

const collections = [
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_512,h_512/thumbnailv2/eth-mainnet/ef7f18b62946b17ff51c1a07f5c0e5c1",
        name: "Axolittle",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/d646455e202efca120610a8741a73204",
        name: "Epic Wizard Union",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5808dde0234b3244ace9a57230c2baf",
        name: "Rabbit College Club",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5928216456be6bb55e6cf1fb1c3e5b8",
        name: "Reckless Whales",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/3a62f5acd387614e2bdc48ffee1e5ec6",
        name: "Whiskers",
    },

    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_512,h_512/thumbnailv2/eth-mainnet/ef7f18b62946b17ff51c1a07f5c0e5c1",
        name: "Axolittle",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/d646455e202efca120610a8741a73204",
        name: "Epic Wizard Union",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5808dde0234b3244ace9a57230c2baf",
        name: "Rabbit College Club",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/e5928216456be6bb55e6cf1fb1c3e5b8",
        name: "Reckless Whales",
    },
    {
        image: "https://res.cloudinary.com/alchemyapi/image/upload/w_256,h_256/thumbnailv2/eth-mainnet/3a62f5acd387614e2bdc48ffee1e5ec6",
        name: "Whiskers",
    },
];

export const ArticleCard = (): JSX.Element => (
    <div className="transition-default flex flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-white">
        <div>
            <div
                className="aspect-[3/2] p-2 pb-0"
                data-testid="ArticleImage"
            >
                <Img
                    src={"https://i.seadn.io/gcs/files/2fcc60cfe712bf9d62a1f521e8f952ad.jpg?w=500&auto=format"}
                    className="aspect-[3/2] min-w-full rounded-xl object-cover"
                />
            </div>
        </div>
        <div className="px-6 py-4">
            <div className="shrink-0 text-sm font-medium leading-5.5 text-theme-secondary-700">24 Oct 2023</div>
            <p className="line-clamp-2 h-14 text-lg">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto corporis delectus dolorum esse
                ipsum neque nisi odio possimus quisquam sequi, veritatis voluptas voluptatem voluptatibus! Corporis
                ducimus eos exercitationem obcaecati voluptate!
            </p>
        </div>
        <div className="rounded-b-xl border-theme-secondary-300 bg-theme-secondary-50 px-6 py-3">
            <div className="flex items-center space-x-2 overflow-hidden">
                <div className="shrink-0 text-sm font-medium leading-5.5 text-theme-secondary-700">
                    Featured collections:
                </div>
                <div className="flex flex-1">
                    <CollectionCircles />
                </div>
            </div>
        </div>
    </div>
);

const CollectionCircles = (): JSX.Element => {
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
            className="1h-6 flex grow flex-wrap"
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
