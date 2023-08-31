import { useEffect } from "react";

interface Properties<T extends HTMLElement> {
    element: T | null;
    handler: (event: FocusEvent) => void;
    enabled?: boolean;
}

const useOnBlurOutside = <T extends HTMLElement>({ element, handler, enabled = true }: Properties<T>): void => {
    useEffect(() => {
        if (element == null) {
            return;
        }

        const handleBlurOutside = (event: FocusEvent): void => {
            if (element.contains(event.relatedTarget as Node)) {
                // Ignore the event if it was triggered by an element inside the ref
                return;
            }

            handler(event);
        };

        if (enabled) {
            element.addEventListener("focusout", handleBlurOutside);
        }

        return () => {
            element.removeEventListener("focusout", handleBlurOutside);
        };
    }, [element, handler, enabled]);
};

export default useOnBlurOutside;
