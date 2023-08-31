import { useEffect, useRef } from "react";

export const usePrevious = <T>(value: T): T | undefined => {
    const reference = useRef<T>();

    useEffect(() => {
        reference.current = value;
    }, [value]);

    return reference.current;
};
