export interface OverlayProperties extends React.HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    showCloseButton: boolean;
    belowContent?: React.ReactNode;
}
