import cn from "classnames";
import React from "react";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";

export const CollectionImageWithIcon = ({
    image,
    chainId,
    className,
    wrapperClassName,
    networkClassName,
}: {
    image: string | null;
    chainId: App.Enums.Chain;
    className?: string;
    wrapperClassName?: string;
    networkClassName?: string;
}): JSX.Element => (
    <div className={className}>
        <Img
            wrapperClassName={wrapperClassName}
            className="h-full w-full rounded-full object-cover"
            src={image}
            isCircle
        />

        <div
            className={cn(
                "absolute block h-4 w-4 rounded-full ring-4 ring-white dark:ring-theme-dark-900 md:left-8 md:top-8",
                networkClassName,
            )}
        >
            <NetworkIcon networkId={chainId} />
        </div>
    </div>
);
