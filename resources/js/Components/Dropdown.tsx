/* eslint-disable sonarjs/cognitive-complexity */
import { Portal, Transition } from "@headlessui/react";
import { type Method } from "@inertiajs/core";
import { Link } from "@inertiajs/react";
import cn from "classnames";
import {
    createContext,
    type CSSProperties,
    Fragment,
    type KeyboardEventHandler,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePopper } from "react-popper";
import useOnBlurOutside from "@/Hooks/useOnBlurOutside";
import useOnClickOutside from "@/Hooks/useOnClickOutside";
import { getFirstFocusableElement, getNextFocusableElement, getPreviousFocusableElement } from "@/Utils/get-focusable";

interface Context {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;
    withPopper: boolean;
    withPortal: boolean;
    popperTrigger: HTMLDivElement | null;
    setPopperTrigger: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    popperDropdown: HTMLDivElement | null;
    setPopperDropdown: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    popperAttributes?: Record<string, Record<string, string> | undefined | CSSProperties>;
}

const DropDownContext = createContext<Context | undefined>(undefined);

interface DropDownProperties {
    children: React.ReactNode;
    relative?: boolean;
    className?: string;
    withPopper?: boolean;
    withPortal?: boolean;
}

const Dropdown = ({
    children,
    withPopper = false,
    withPortal = false,
    relative = true,
    className = "",
}: DropDownProperties): JSX.Element => {
    const [open, setOpen] = useState(false);

    const toggleOpen = (): void => {
        setOpen((previousState) => !previousState);
    };

    const wrapperReference = useRef<HTMLDivElement>(null);

    const [popperTrigger, setPopperTrigger] = useState<HTMLDivElement | null>(null);
    const [popperDropdown, setPopperDropdown] = useState<HTMLDivElement | null>(null);

    const popperData = withPopper
        ? usePopper(popperTrigger, popperDropdown, {
              placement: "bottom-end",
              modifiers: [
                  {
                      name: "computeStyles",
                      options: {
                          adaptive: false, // true by default
                      },
                  },
              ],
          })
        : undefined;

    useOnClickOutside({
        enabled: open,
        ref: wrapperReference,
        handler: (event: MouseEvent | TouchEvent) => {
            if (withPortal) {
                const isChildOfDropdown = popperDropdown?.contains(event.target as Node);

                if (isChildOfDropdown === true) {
                    return;
                }
            }

            setOpen(false);
        },
    });

    useOnBlurOutside({
        enabled: open,
        element: wrapperReference.current,
        handler: (event: FocusEvent) => {
            if (withPortal) {
                const isChildOfDropdown = popperDropdown?.contains(event.relatedTarget as Node);

                if (isChildOfDropdown === true) {
                    return;
                }
            }

            setOpen(false);
        },
    });

    useOnBlurOutside({
        // Only needed when withPopper is true since the dropdown is not a child
        // of the wrapper
        enabled: open && withPopper,
        element: popperDropdown,
        handler: () => {
            setOpen(false);
        },
    });

    return (
        <DropDownContext.Provider
            value={{
                open,
                setOpen,
                toggleOpen,
                withPopper,
                withPortal,
                popperTrigger,
                setPopperTrigger,
                popperDropdown,
                setPopperDropdown,
                popperAttributes:
                    popperData != null
                        ? {
                              ...popperData.attributes.popper,
                              style: popperData.styles.popper,
                          }
                        : undefined,
            }}
            data-testid="Dropdown"
        >
            <div
                ref={wrapperReference}
                className={cn({ relative }, className)}
            >
                {children}
            </div>
        </DropDownContext.Provider>
    );
};

const useDropdownContext = (): Context => {
    const context = useContext(DropDownContext);

    if (context === undefined) {
        throw new Error("useDropdownContext must be within DropDownContext.Provider");
    }

    return context;
};

interface TriggerProperties {
    children: ({ open }: Context) => JSX.Element;
    className?: string;
}

const Trigger = ({ children, className }: TriggerProperties): JSX.Element => {
    const context = useDropdownContext();

    const { toggleOpen, popperDropdown, withPortal, withPopper, setPopperTrigger } = context;

    const keydownHandler = useCallback<KeyboardEventHandler<HTMLDivElement>>(
        (event) => {
            if (!withPortal) {
                return;
            }

            if (event.key === "Tab" && !event.shiftKey && popperDropdown != null) {
                // Since the dropdown is not a direct child of the trigger, we
                // need to find the first focusable element inside the dropdown
                // and focus it manually.
                const firstFocusableElement = getFirstFocusableElement(popperDropdown);

                if (firstFocusableElement != null) {
                    event.preventDefault();

                    firstFocusableElement.focus();
                }
            }
        },
        [popperDropdown, withPortal],
    );

    return (
        <>
            <div
                onClick={toggleOpen}
                className={className}
                ref={withPopper ? setPopperTrigger : undefined}
                onKeyDown={keydownHandler}
            >
                {children(context)}
            </div>
        </>
    );
};

interface ContentProperties extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    align?: string;
    contentClasses?: string;
    children:
        | JSX.Element
        | JSX.Element[]
        | (({ setOpen }: { setOpen: (open: boolean) => void }) => JSX.Element | JSX.Element[]);
}

const ContentWrapper = ({ children, withPortal }: { children: JSX.Element; withPortal: boolean }): JSX.Element => {
    if (withPortal) {
        return <Portal>{children}</Portal>;
    }

    return children;
};

const Content = ({
    align = "left",
    className = "",
    contentClasses = "ring-1 ring-black ring-opacity-5 py-1 bg-white dark:bg-theme-dark-900",
    children,
    ...properties
}: ContentProperties): JSX.Element => {
    const {
        open,
        withPortal,
        withPopper,
        setOpen,
        setPopperDropdown,
        popperDropdown,
        popperTrigger,
        popperAttributes,
    } = useDropdownContext();
    const [requiresPositioning, setRequiresPositioning] = useState(withPopper);
    const [positioning, setPositioning] = useState<boolean>();

    let alignmentClasses: string | undefined;

    if (!withPopper) {
        if (align === "left") {
            alignmentClasses = "origin-top-left left-0";
        } else if (align === "right") {
            alignmentClasses = "origin-top-right right-0";
        } else {
            alignmentClasses = "origin-top";
        }
    }

    useEffect(() => {
        // Popper needs the element on the DOM before to calculate the
        // initial position.
        if (open && requiresPositioning) {
            setPositioning(true);
        }
    }, [open, requiresPositioning]);

    useEffect(() => {
        // Means that the positioning is done.
        if (positioning === false && requiresPositioning) {
            setRequiresPositioning(false);
        }
    }, [positioning, requiresPositioning]);

    const show = useMemo(() => {
        if (!withPopper) {
            return open;
        }

        // Show until the positioning is done.
        return open && !requiresPositioning && positioning === false;
    }, [open, withPopper, requiresPositioning, positioning]);

    // If the dropdown is closed it may need to recalculate the position
    // when the window is resized.
    useEffect(() => {
        if (!withPopper || show) {
            return;
        }

        const resizeListener = (): void => {
            setRequiresPositioning(true);

            // Reset the positioning state to unknown since using
            // `false` will reset the "requires position" state.
            setPositioning(undefined);
        };

        window.addEventListener("resize", resizeListener);

        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, [withPopper, show]);

    const keydownHandler = useCallback<KeyboardEventHandler<HTMLDivElement>>(
        (event) => {
            if (!withPortal || event.key !== "Tab") {
                return;
            }

            let focusTarget: HTMLElement | null = null;

            if (event.shiftKey) {
                focusTarget = getPreviousFocusableElement(popperDropdown as HTMLElement, event.target as HTMLElement);
            } else {
                focusTarget = getNextFocusableElement(popperDropdown as HTMLElement, event.target as HTMLElement);
            }

            // If there is a focus target, no need to do anything we can just
            // let the browser handle the focus.
            if (focusTarget != null) {
                return;
            }

            // If next element is null we need to focus the next element
            // relative to the trigger. We need to do this because the
            // dropdown is not a direct child of the dropdown.
            const triggerButton = getFirstFocusableElement(popperTrigger as HTMLElement);

            if (triggerButton == null) {
                return;
            }

            if (event.shiftKey) {
                // If reverse tabbing, we need to focus the trigger
                // again.
                focusTarget = triggerButton;
            } else {
                // If tabbing forward, we need to focus the next
                // element relative to the trigger.
                focusTarget = getNextFocusableElement(document.body, triggerButton);
            }

            event.preventDefault();
            focusTarget?.focus();
        },
        [withPortal, popperTrigger, popperDropdown],
    );

    return (
        <ContentWrapper withPortal={withPortal}>
            <Transition
                as={Fragment}
                show={show || positioning === true}
                enter={positioning === true ? "" : "transition ease-out duration-200"}
                enterFrom={positioning === true ? "" : "transform opacity-0 scale-95"}
                enterTo={positioning === true ? "" : "transform opacity-100 scale-100"}
                leave={positioning === true ? "" : "transition ease-in duration-75"}
                leaveFrom={positioning === true ? "" : "transform opacity-100 scale-100"}
                leaveTo={positioning === true ? "" : "transform opacity-0 scale-95"}
                afterEnter={() => {
                    setPositioning(false);
                }}
            >
                <div
                    data-testid="Dropdown__content-wrapper"
                    className={cn("z-50", alignmentClasses, className, {
                        "absolute mt-2": !withPopper,
                        "pointer-events-none absolute opacity-0": positioning === true,
                    })}
                    tabIndex={-1}
                    ref={withPopper ? setPopperDropdown : undefined}
                    onKeyDown={keydownHandler}
                    data-popper={withPopper}
                    {...properties}
                    {...popperAttributes}
                >
                    <div className={cn(contentClasses)}>
                        {typeof children === "function" ? children({ setOpen }) : children}
                    </div>
                </div>
            </Transition>
        </ContentWrapper>
    );
};

interface LinkProperties {
    href: string;
    method?: Method;
    as?: string;
    children?: React.ReactNode;
}

const DropdownLink = ({ href, method, as, children }: LinkProperties): JSX.Element => (
    <Link
        data-testid="DropdownLink"
        href={href}
        method={method}
        as={as}
        className="block w-full px-4 py-2 text-left text-sm leading-5 text-theme-secondary-700 transition duration-150 ease-in-out hover:bg-theme-secondary-100 focus:bg-theme-secondary-100 focus:outline-none"
    >
        {children}
    </Link>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export { Dropdown };
