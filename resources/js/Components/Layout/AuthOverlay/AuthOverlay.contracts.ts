export interface AuthOverlayProperties extends React.HTMLAttributes<HTMLDivElement> {}

export interface ConnectWalletProperties {
    shouldShowSignMessage: boolean;
    isWalletInitialized: boolean;
    shouldRequireSignature: boolean;
    onConnect: () => void;
}

export interface ConnectionErrorProperties {
    errorMessage?: string;
    onConnect: () => void;
}
