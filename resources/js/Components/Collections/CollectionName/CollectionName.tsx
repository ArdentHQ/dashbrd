import { type ReactNode, useRef } from "react";
import cn from "classnames";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";

interface Properties {
    collection: Pick<App.Data.Collections.CollectionData, "name" | "chainId" | "image">;
    className?: string;
    children?: ReactNode;
}

export const CollectionName = ({ collection, className, children }: Properties): JSX.Element => {
    const nameReference = useRef<HTMLParagraphElement>(null);
    const isTruncated = useIsTruncated({ reference: nameReference });

    return (
        <div
            data-testid="CollectionName"
            className={cn("group relative h-11 w-full cursor-pointer md:h-20", className)}
        >
            <div className="absolute flex w-full items-center space-x-4">
                <div className="relative h-8 w-8 shrink-0 md:h-20 md:w-20">
                    <Img
                        wrapperClassName="aspect-square"
                        className="h-full w-full rounded-full object-cover"
                        src={collection.image}
                        alt={collection.name}
                        isCircle
                    />

                    <NetworkIcon
                        className="absolute left-5 top-5 block h-4 w-4 rounded-full ring-4 ring-white dark:ring-theme-dark-900 md:hidden"
                        networkId={collection.chainId}
                    />
                </div>

                <div className="break-word-legacy min-w-0 space-y-0.5">
                    <Tooltip
                        disabled={!isTruncated}
                        content={collection.name}
                    >
                        <p
                            ref={nameReference}
                            data-testid="CollectionName__name"
                            className="group-hover md:leading-auto truncate text-sm font-medium leading-6 text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400 md:text-lg"
                        >
                            {collection.name}
                        </p>
                    </Tooltip>

                    {children !== undefined && (
                        <span
                            data-testid="CollectionName__detail"
                            className="block truncate text-xs font-medium leading-4.5 text-theme-secondary-500 md:hidden"
                        >
                            {children}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
