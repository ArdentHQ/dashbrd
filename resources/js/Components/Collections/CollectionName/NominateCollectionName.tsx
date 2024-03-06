import cn from "classnames";
import { useRef } from "react";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { FormatVolume } from "@/Utils/Currency";

export const NominateCollectionName = ({
    collection,
    isDisabled,
}: {
    collection: App.Data.Collections.VotableCollectionData;
    isDisabled?: boolean;
}): JSX.Element => {
    const collectionNameReference = useRef<HTMLParagraphElement>(null);
    const isTruncated = useIsTruncated({ reference: collectionNameReference });

    return (
        <div
            data-testid="NominateCollectionName"
            className="group relative h-11 w-full cursor-pointer"
        >
            <div className="absolute flex w-full items-center space-x-4">
                <div className="relative h-12 w-12 shrink-0">
                    <Img
                        wrapperClassName="aspect-square"
                        className={cn("h-full w-full rounded-full object-cover", { "grayscale-[50%]": isDisabled })}
                        src={collection.image}
                        isCircle
                    />
                </div>

                <div className="break-word-legacy min-w-0 space-y-0.5">
                    <Tooltip
                        disabled={!isTruncated}
                        content={collection.name}
                    >
                        <p
                            ref={collectionNameReference}
                            data-testid="CollectionName__name"
                            className="group-hover md:leading-auto truncate text-sm font-medium leading-6 text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400 md:text-lg"
                        >
                            {collection.name}
                        </p>
                    </Tooltip>

                    <p
                        className="text-sm font-medium text-theme-secondary-700 dark:text-theme-dark-200 md:hidden"
                        data-testid="CollectionName__volume"
                    >
                        <FormatVolume volume={collection.volume} />
                    </p>
                </div>
            </div>
        </div>
    );
};
