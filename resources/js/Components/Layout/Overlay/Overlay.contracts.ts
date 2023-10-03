export interface OverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    showOverlay: boolean;
    showCloseButton: boolean;
    showBackButton: boolean;
    belowContent?: React.ReactNode;
}
