export interface AuthOverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    showAuthOverlay: boolean;
    showCloseButton: boolean;
    closeOverlay: () => void;
}

export interface ConnectWalletProperties {
    shouldShowSignMessage: boolean;
    isWalletInitialized: boolean;
    shouldRequireSignature: boolean;
    onConnect: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}

export interface ConnectionErrorProperties {
    errorMessage?: string;
    onConnect: () => void;
    closeOverlay: () => void;
    showCloseButton: boolean;
}
