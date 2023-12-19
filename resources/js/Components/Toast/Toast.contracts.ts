import { type IconDimensions } from "@/Components/Icon";

export interface ToastMessage {
    title?: string;
    message: string | null;
    type?: ToastType;
    isExpanded?: boolean;
    isStatic?: boolean;
    isLoading?: boolean;
    onClose?: () => void;
}

export type ToastType = "pending" | "success" | "warning" | "error" | "info";

export interface ToastProperties {
    title?: string;
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
