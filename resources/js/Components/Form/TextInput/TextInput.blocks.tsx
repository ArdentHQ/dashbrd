import cn from "classnames";
import { type TextInputAvatarProperties } from "./TextInput.contracts";
import { Button, type ButtonProperties } from "@/Components/Buttons/Button";

export const TextInputButton = ({ className, ...properties }: ButtonProperties): JSX.Element => (
    <Button
        data-testid="TextInput__button"
        className={cn("h-8 px-4 text-sm disabled:cursor-not-allowed", className)}
        variant="secondary"
        {...properties}
    />
);

export const TextInputAvatar = ({ children, className, ...properties }: TextInputAvatarProperties): JSX.Element => (
    <div
        data-testid="TextInput__avatar"
        className={cn(
            "flex h-8 w-8 flex-shrink-0 flex-grow-0 items-center justify-center overflow-hidden rounded-full bg-theme-secondary-100",
            className,
        )}
        {...properties}
    >
        {children}
    </div>
);
