import cn from "classnames";
import { createContext, useContext } from "react";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

interface GalleryCardProperties {
    children: React.ReactNode;
    className?: string;
    isSelected: boolean;
    fixedOnMobile?: boolean;
    onClick?: () => void;
}

const Context = createContext<{
    isSelected: boolean;
    fixedOnMobile: boolean;
}>({
    isSelected: false,
    fixedOnMobile: false,
});

const useSelected = (): {
    isSelected: boolean;
    fixedOnMobile: boolean;
} => useContext(Context);

const SelectedProvider = ({
    value,
    children,
}: {
    value: {
        isSelected: boolean;
        fixedOnMobile: boolean;
    };
    children: React.ReactNode;
}): JSX.Element => <Context.Provider value={value}>{children}</Context.Provider>;

const GalleryCardRoot = ({
    children,
    className,
    isSelected,
    fixedOnMobile = false,
    onClick,
}: GalleryCardProperties): JSX.Element => {
    const { isLgAndAbove } = useBreakpoint();

    const clickHandler = (): void => {
        if (fixedOnMobile && !isLgAndAbove) {
            return;
        }

        if (onClick !== undefined) onClick();
    };

    return (
        <SelectedProvider
            value={{
                isSelected,
                fixedOnMobile,
            }}
        >
            <div
                data-testid="GalleryCard"
                className={cn(
                    "transition-default group relative aspect-square overflow-hidden rounded-xl bg-theme-secondary-100 outline-none outline-3 outline-offset-0",
                    { "outline-theme-primary-300": isSelected },
                    fixedOnMobile
                        ? {
                              "lg:cursor-pointer": className === undefined || !className.includes("cursor-"),
                          }
                        : {
                              "cursor-pointer": className === undefined || !className.includes("cursor-"),
                          },
                    className,
                )}
                onClick={clickHandler}
            >
                {children}
            </div>
        </SelectedProvider>
    );
};

const GalleryCardOverlay = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const { isSelected, fixedOnMobile } = useSelected();

    return (
        <div
            data-testid="GalleryCard__overlay"
            className={cn(
                "transition-default absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-theme-primary-50/75 px-8 text-center dark:bg-theme-dark-900/75",
                {
                    "group-hover:pointer-events-auto group-hover:opacity-100 group-hover:backdrop-blur-md":
                        !fixedOnMobile,
                    "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:backdrop-blur-md":
                        !fixedOnMobile,
                    "lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-hover:backdrop-blur-md":
                        fixedOnMobile,
                    "lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100 lg:group-focus-within:backdrop-blur-md":
                        !fixedOnMobile,
                    "pointer-events-auto opacity-100 backdrop-blur-md": isSelected,
                    "pointer-events-none opacity-0 backdrop-blur-0": !isSelected,
                },
            )}
        >
            {children}
        </div>
    );
};

export const GalleryCard = Object.assign(GalleryCardRoot, {
    Overlay: GalleryCardOverlay,
});
