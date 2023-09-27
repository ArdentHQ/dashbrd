import { type RefObject, useEffect } from "react";

export const useResizeObserver = (reference: RefObject<Element>, callback: () => void): void => {
    useEffect(() => {
        if (reference.current !== null) {
            const observer = new ResizeObserver(callback);
            observer.observe(reference.current);

            return () => {
                observer.disconnect();
            };
        }
    }, []);
};
