import cn from "classnames";
import { Img } from "@/Components/Image";
import { isTruthy } from "@/Utils/is-truthy";

export const CollectionCoverImages = ({ nfts }: { nfts: App.Data.Collections.SimpleNftData[] }): JSX.Element => {
    const [cover, second, third, ...rest] = nfts;

    return (
        <div
            className="grid grid-cols-3 gap-2"
            data-testid="CollectionCoverImages"
        >
            {isTruthy(cover) && (
                <div className="col-span-2 row-span-2">
                    <Img
                        key={cover.id}
                        data-testid="CollectionCoverImages__cover"
                        src={cover.images.large}
                        className={cn("aspect-square h-full w-full shrink-0 rounded-xl object-cover", {
                            "ml-0.5 translate-x-1/4": nfts.length === 1,
                        })}
                    />
                </div>
            )}

            {isTruthy(second) && (
                <>
                    <Img
                        src={second.images.small}
                        className="aspect-square rounded-xl object-cover"
                        data-testid="CollectionCoverImages__second"
                    />

                    {isTruthy(third) && (
                        <div className="relative overflow-hidden rounded-lg backdrop-blur-0">
                            <Img
                                src={third.images.small}
                                className="aspect-square rounded-xl object-cover"
                                data-testid="CollectionCoverImages__third"
                            />

                            {rest.length > 0 && (
                                <div
                                    data-testid="CollectionCoverImages__more"
                                    className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-md dark:bg-theme-dark-900/75"
                                >
                                    <span className="text-base font-medium dark:text-theme-dark-50">
                                        +{rest.length + 1}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
