import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import cn from "classnames";
import { useEffect, useRef } from "react";
import { type OverlayProperties } from "./Overlay.contracts";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";

export const Overlay = ({
    className,
    showOverlay,
    showCloseButton,
    children,
    belowContent,
    ...properties
}: OverlayProperties): JSX.Element => {
    const reference = useRef<HTMLDivElement>(null);
    const { isDark } = useDarkModeContext();

    useEffect(() => {
        if (!showOverlay || reference.current === null) {
            clearAllBodyScrollLocks();

            document.querySelector("#layout")?.classList.remove("blur");
        } else {
            disableBodyScroll(reference.current);

            if (!isDark) {
                document.querySelector("#layout")?.classList.add("blur");
            }
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
                "fixed inset-0 z-40 mt-14 flex h-screen w-screen flex-col items-center justify-start overflow-auto bg-white dark:bg-theme-dark-950/90 xs:mt-18 sm:mt-0 sm:justify-center",
                className,
                {
                    "bg-opacity-60": !showCloseButton,
                    "bg-opacity-90": showCloseButton,
                },
            )}
        >
            <div className="auth-overlay-shadow w-full rounded-none bg-white dark:bg-theme-dark-950 sm:w-[29rem] sm:rounded-3xl">
                <div className="mt-8 flex flex-col items-center space-y-6">{children}</div>
            </div>
            {belowContent}
        </div>
    );
};
