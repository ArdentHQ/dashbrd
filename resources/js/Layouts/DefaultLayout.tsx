import classNames from "classnames";
import { useState } from "react";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { SliderContext } from "@/Components/Slider";
import { type ToastMessage } from "@/Components/Toast";

interface Properties {
    header?: React.ReactNode;
    children?: React.ReactNode;
    error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    toastMessage?: ToastMessage;
    wrapperClassName?: string;
    isMaintenanceModeActive?: boolean;
}

export const DefaultLayout = ({
    header,
    children,
    toastMessage,
    wrapperClassName,
    isMaintenanceModeActive = false,
}: Properties): JSX.Element => {
    const [isBreakdownOpen, setBreakdownOpen] = useState(false);

    return (
        <SliderContext.Provider value={{ isOpen: isBreakdownOpen, setOpen: setBreakdownOpen }}>
            <LayoutWrapper
                toastMessage={toastMessage}
                isMaintenanceModeActive={isMaintenanceModeActive}
            >
                {header !== undefined && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <section className={classNames(wrapperClassName)}>{children}</section>
            </LayoutWrapper>
        </SliderContext.Provider>
    );
};
