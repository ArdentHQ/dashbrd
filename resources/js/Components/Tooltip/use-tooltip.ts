import { type Instance } from "tippy.js";
import { isTruthy } from "@/Utils/is-truthy";

export const useTooltip = (properties?: {
    hideAfter?: number;
}): {
    handleShow: (instance: Instance) => void;
} => {
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
    };
};
