import { type MouseEvent } from "react";

export interface TextInputProperties extends React.InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
    hasError?: boolean;
    wrapperClassName?: string;
    after?: React.ReactElement;
    before?: React.ReactElement;
}

export interface TextInputAvatarProperties extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export interface UseTextInputReturnType {
    isMouseOver: boolean;
    handleMouseOver: (event: MouseEvent) => void;
    handleMouseOut: () => void;
}
