export interface AuthOverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    closeOverlay: () => void;
}

export interface ConnectWalletProperties {
    showSignMessage: boolean;
    isWalletInitialized: boolean;
    requiresSignature: boolean;
    onConnect: () => void;
    onSign: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}

export interface ConnectionErrorProperties {
    errorMessage?: string;
    onConnect: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}
