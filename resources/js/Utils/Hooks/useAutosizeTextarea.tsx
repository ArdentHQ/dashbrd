import { useEffect } from "react";

const useAutosizeTextarea = (reference: HTMLTextAreaElement | null, value: string): void => {
    useEffect(() => {
        const handleResize = (): void => {
            if (reference !== null) {
                reference.style.height = "40px";
                const scrollHeight = reference.scrollHeight;

                reference.style.height = `${scrollHeight < 40 ? 40 : scrollHeight}px`;
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return (): void => {
            window.removeEventListener("resize", handleResize);
        };
    }, [reference, value]);
};

export default useAutosizeTextarea;
