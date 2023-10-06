import toastService from "react-hot-toast";
import { type ToastMessage, ToastTemplate } from "@/Components/Toast";
import { isTruthy } from "@/Utils/is-truthy";

const showToast = (toastMessage?: ToastMessage): void => {
    if (!isTruthy(toastMessage) || !isTruthy(toastMessage.message)) {
        return;
    }

    toastService.custom(
        (toast: { id: string; visible: boolean }) => (
            <ToastTemplate
                isVisible={toast.visible}
                toastMessage={toastMessage}
                onClose={() => {
                    toastService.dismiss(toast.id);
                }}
            />
        ),
        {
            duration:
                isTruthy(toastMessage.isStatic) || isTruthy(toastMessage.isLoading) ? Number.POSITIVE_INFINITY : 5000,
        },
    );
};

export const useToasts = (): {
    showToast: (toastMessage?: ToastMessage) => void;
    clear: () => void;
} => ({
    showToast,
    clear: () => {
        toastService.dismiss();
    },
});
