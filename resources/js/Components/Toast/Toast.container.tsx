import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { type ToastMessage } from ".";
import { useToasts } from "@/Hooks/useToasts";

export const ToastContainer = ({ toastMessage }: { toastMessage?: ToastMessage }): JSX.Element => {
    const { showToast } = useToasts();

    useEffect(() => {
        showToast(toastMessage);
    }, [toastMessage]);

    return (
        <Toaster
            position="bottom-right"
            gutter={15}
        />
    );
};
