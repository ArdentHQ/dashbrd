import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number): [T, boolean] => {
    const [loading, setLoading] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        setLoading(true);

        const handler = setTimeout(() => {
            setDebouncedValue(value);
            setLoading(false);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return [debouncedValue, loading];
};
