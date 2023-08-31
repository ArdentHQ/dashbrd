import cn from "classnames";
import { useCallback, useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {}

export const CustomScroll = ({ className, children, ...properties }: Properties): JSX.Element => {
    const [isScroll, setIsScroll] = useState(false);

    const handleResize = useCallback((_width?: number, height?: number) => {
        /* istanbul ignore next -- @preserve */
        setIsScroll((height ?? 0) > window.innerHeight);
    }, []);

    const { height, ref: reference } = useResizeDetector<HTMLDivElement>({
        handleWidth: false,
        onResize: handleResize,
    });

    const handleWindowResize = useCallback(() => {
        handleResize(undefined, height);
    }, [handleResize, height]);

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, [handleWindowResize]);

    return (
        <div
            data-testid="CustomScroll"
            className={cn(
                "custom-scroll relative overflow-x-hidden overflow-y-scroll",
                { "custom-scroll-active": isScroll },
                className,
            )}
            {...properties}
        >
            <div
                ref={reference}
                className={cn({ "-mr-1.5": isScroll })}
            >
                {children}
            </div>
        </div>
    );
};
