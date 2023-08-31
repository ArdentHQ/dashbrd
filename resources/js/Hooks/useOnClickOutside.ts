import { type RefObject, useEffect } from "react";

interface Properties<T extends HTMLElement> {
    ref: RefObject<T>;
    handler: (event: MouseEvent | TouchEvent) => void;
    enabled?: boolean;
}

const useOnClickOutside = <T extends HTMLElement>({ ref, handler, enabled = true }: Properties<T>): void => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleClickOutside = (event: MouseEvent | TouchEvent): void => {
            if (ref.current != null && !ref.current.contains(event.target as Node)) {
                handler(event);
            }
        };

        // Bind touch and mouse event listeners
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            // Unbind touch and mouse event listeners
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [ref, handler, enabled]);
};

export default useOnClickOutside;
