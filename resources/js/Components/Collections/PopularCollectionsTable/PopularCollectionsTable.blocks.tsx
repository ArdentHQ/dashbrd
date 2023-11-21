import { useRef } from "react";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";

export const PopularCollectionName = ({
    collection,
}: {
    collection: App.Data.Collections.PopularCollectionData;
}): JSX.Element => {
    const collectionNameReference = useRef<HTMLParagraphElement>(null);
    const isTruncated = useIsTruncated({ reference: collectionNameReference });

    return (
        <div
            data-testid="CollectionName"
            className="group relative h-11 w-full cursor-pointer md:h-20"
        >
            <div className="absolute flex w-full  items-center space-x-4">
                <div className="relative h-8 w-8 shrink-0 md:h-12 md:w-12">
                    <Img
                        wrapperClassName="aspect-square"
                        className="h-full w-full rounded-full object-cover"
                        src={collection.image}
                        isCircle
                    />

                    <div className="absolute left-5 top-5 block h-4 w-4 rounded-full ring-4 ring-white md:left-8 md:top-8">
                        <NetworkIcon networkId={collection.chainId} />
                    </div>
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
                </div>
            </div>
        </div>
    );
};
