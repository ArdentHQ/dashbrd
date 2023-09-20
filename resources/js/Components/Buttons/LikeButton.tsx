import cn from "classnames";
import { Button, type ButtonProperties } from "@/Components/Buttons/Button";

type LikeButtonProperties = Omit<ButtonProperties, "variant">;

export const LikeButton = ({ children, className, ...properties }: LikeButtonProperties): JSX.Element => (
    <Button
        variant="bordered"
        className={cn(className, "button-like")}
        {...properties}
        iconClass="text-theme-primary-900"
    >
        <span className="text-sm font-medium text-theme-secondary-700">{children}</span>
    </Button>
);
