import { type Instance } from "tippy.js";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { isTruthy } from "@/Utils/is-truthy";

export const useTooltip = (properties?: {
    hideAfter?: number;
    disableOnTouch?: boolean;
}): {
    handleShow: (instance: Instance) => void;
    isDisabled: boolean;
} => {
    const { isTouch } = useBreakpoint();

    const handleShow = (instance: Instance): void => {
        if (!isTruthy(properties?.hideAfter)) {
            return;
        }

        setTimeout(() => {
            instance.hide();
        }, properties?.hideAfter);
    };

    return {
        handleShow,
        isDisabled: isTruthy(properties?.disableOnTouch) && isTouch,
    };
};
