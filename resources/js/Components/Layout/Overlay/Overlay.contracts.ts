export interface OverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    showOverlay: boolean;
    showCloseButton: boolean;
    belowContent?: React.ReactNode;
}
