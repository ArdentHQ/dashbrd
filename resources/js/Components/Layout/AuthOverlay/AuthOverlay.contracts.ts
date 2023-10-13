import { type OverlayProperties } from "@/Components/Layout/Overlay/Overlay.contracts";

export interface AuthOverlayProperties extends Omit<OverlayProperties, "showOverlay"> {
    show: boolean;
    closeOverlay: () => void;
    mustBeSigned?: boolean;
    sessionMayExpired: boolean;
    showBackButton: boolean;
}

export interface ConnectWalletProperties {
    isWalletInitialized: boolean;
    requiresSignature: boolean;
    onConnect: () => void;
    onSign: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
    showBackButton: boolean;
}

export interface ConnectionErrorProperties {
    requiresSignature: boolean;
    onConnect: () => void;
    onSign: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}
