export interface AuthOverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
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
