import { type ToastType } from "./Toast.contracts";
import { type IconName } from "@/Components/Icon";

export const toastMetadataByType = (type: ToastType): { title: string; icon: IconName } => {
    if (type === "success") {
        return {
            title: "Successful",
            icon: "CheckInCircle",
        };
    }

    if (type === "warning") {
        return {
            title: "Warning",
            icon: "ExclamationInTriangle",
        };
    }

    if (type === "error") {
        return {
            title: "Error",
            icon: "XInCircle",
        };
    }

    if (type === "info") {
        return {
            title: "Information",
            icon: "InfoInCircle",
        };
    }

    return {
        title: "Pending",
        icon: "Clock",
    };
};
