import { type MouseEvent, type RefObject, useState } from "react";
import { type UseTextInputReturnType } from "./TextInput.contracts";

export const useTextInput = ({ input }: { input: RefObject<HTMLInputElement> }): UseTextInputReturnType => {
    const [isMouseOver, setIsMouseOver] = useState(false);

    const handleMouseOut = (): void => {
        setIsMouseOver(false);
    };

    const handleMouseOver = (event: MouseEvent): void => {
        if (
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement ||
            event.target instanceof HTMLButtonElement ||
            event.target instanceof HTMLAnchorElement ||
            // if the target is an input ensure is not the input of the component
            (event.target instanceof HTMLInputElement && event.target !== input.current)
        ) {
            return;
        }

        setIsMouseOver(true);
    };

    return {
        isMouseOver,
        handleMouseOut,
        handleMouseOver,
    };
};
