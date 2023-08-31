import { type IconDimensions } from "@/Components/Icon";

export interface ToastMessage {
    message: string | null;
    type?: ToastType;
    isExpanded?: boolean;
    isStatic?: boolean;
    isLoading?: boolean;
}

export type ToastType = "pending" | "success" | "warning" | "error" | "info";

export interface ToastProperties {
    message: React.ReactNode;
    type?: ToastType;
    isStatic?: boolean;
    isExpanded?: boolean;
    isLoading?: boolean;
    className?: string;
    iconDimensions?: IconDimensions;
    onClose?: () => void;
}

export interface ToastTemplateProperties {
    toastMessage: ToastMessage;
    isVisible: boolean;
    onClose?: () => void;
}
