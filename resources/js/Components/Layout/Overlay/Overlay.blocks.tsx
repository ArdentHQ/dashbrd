import cn from "classnames";

interface OverlayButtonsWrapperProperties extends React.HTMLAttributes<HTMLDivElement> {}

export const OverlayButtonsWrapper = ({
    className,
    children,
    ...properties
}: OverlayButtonsWrapperProperties): JSX.Element => (
    <div
        className={cn(
            "border-t-none w-full justify-center space-y-6 border-theme-secondary-300 px-5 pb-5 pt-0 xs:border-t xs:px-8 xs:py-5",
            className,
        )}
        {...properties}
    >
        <div className="flex w-full flex-col justify-center space-y-3 xs:items-center sm:flex-row sm:space-x-3 sm:space-y-0">
            {children}
        </div>
    </div>
);
