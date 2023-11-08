import { ReactNode } from "react";

export interface ImageProperties {
    className?: string;
    wrapperClassName?: string;
    childWrapperClassName?: string;
    errorClassName?: string;
    isCircle?: boolean;
    src?: string | null;
    srcSet?: string;
    alt?: string;
    errorMessage?: string;
    onError?: () => void;
    "data-testid"?: string;
    errorPlaceholder?: ReactNode;
}
