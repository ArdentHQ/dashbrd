import { type RefObject, useEffect, useState } from "react";

export const useIsTruncated = ({ reference }: { reference: RefObject<Element> }): boolean => {
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const handleResize = (entries: ResizeObserverEntry[]): void => {
            if (reference.current != null) {
                const isTruncated = Math.round(entries[0].contentRect.width) < reference.current.scrollWidth;

                setIsTruncated(isTruncated);
            }
        };

        if (reference.current != null) {
            const observer = new ResizeObserver(handleResize);
            observer.observe(reference.current);

            return () => {
                observer.disconnect();
            };
        }
    }, [reference.current]);

    return isTruncated;
};
