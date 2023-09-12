import { type OverlayProperties } from "@/Components/Layout/Overlay/Overlay.contracts";

export interface AuthOverlayProperties extends Omit<OverlayProperties, "showOverlay"> {
    show: boolean;
    closeOverlay: () => void;
}

export interface ConnectWalletProperties {
    isWalletInitialized: boolean;
    shouldRequireSignature: boolean;
    onConnect: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}

export interface ConnectionErrorProperties {
    onConnect: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}
