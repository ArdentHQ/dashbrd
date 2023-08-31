import cn from "classnames";

interface Properties {
    message?: string;
    className?: string;
}

export const InputError = ({ message, className }: Properties): JSX.Element => {
    if (message === undefined || message === "") {
        return <></>;
    }

    return <p className={cn("text-red-600 text-sm", className)}>{message}</p>;
};
