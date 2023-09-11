import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import cn from "classnames";
import { useEffect, useRef } from "react";
import { type OverlayProperties } from "./Overlay.contracts";

export const Overlay = ({
    className,
    showOverlay,
    showCloseButton,
    children,
    ...properties
}: OverlayProperties): JSX.Element => {
    const reference = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showOverlay || reference.current === null) {
            clearAllBodyScrollLocks();
        } else {
            disableBodyScroll(reference.current);
        }

        return () => {
            clearAllBodyScrollLocks();
        };
    }, [showOverlay, reference]);

    if (!showOverlay) return <></>;

    return (
        <div
            data-testid="Overlay"
            ref={reference}
            {...properties}
            className={cn(
                "fixed inset-0 z-40 mt-14 flex h-screen w-screen items-start justify-center overflow-auto bg-white xs:mt-18 sm:mt-0 sm:items-center",
                className,
                {
                    "bg-opacity-60": !showCloseButton,
                    "bg-opacity-90": showCloseButton,
                },
            )}
        >
            <div className="auth-overlay-shadow w-full rounded-none bg-white sm:w-[29rem] sm:rounded-3xl">
                <div className="mt-8 flex flex-col items-center space-y-6">{children}</div>
            </div>
        </div>
    );
};
