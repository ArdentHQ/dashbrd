import cn from "classnames";
import React, { useState } from "react";
import { Icon } from "./Icon";
import { isTruthy } from "@/Utils/is-truthy";

interface AccordionItemProperties {
    title: string | JSX.Element;
    children?: JSX.Element;
}

export const AccordionItem = ({ title, children }: AccordionItemProperties): JSX.Element => {
    const [isOpen, setOpen] = useState(false);

    if (!isTruthy(children)) {
        return <HeadOnlyAccordionItem title={title} />;
    }

    return (
        <div
            data-testid="Accordion__item"
            className="select-none"
        >
            <div
                data-testid="Accordion__item-header"
                className="group cursor-pointer"
                onClick={() => {
                    setOpen(!isOpen);
                }}
            >
                <div className="transition-default mx-2 my-1.5 flex min-w-0 items-center rounded-xl p-2 group-hover:bg-theme-secondary-100 dark:group-hover:bg-theme-dark-800 sm:mx-3 sm:p-3">
                    <div className="min-w-0 flex-1">{title}</div>

                    <div className="ml-2 flex h-6 w-6 items-center justify-center">
                        <Icon
                            name="ChevronDownSmall"
                            size="sm"
                            className={cn(
                                "transform text-theme-secondary-900 transition duration-100 dark:text-theme-dark-50",
                                {
                                    "rotate-180": isOpen,
                                },
                            )}
                        />
                    </div>
                </div>
            </div>

            {isOpen && <div className="px-6 pb-4">{children}</div>}
        </div>
    );
};

const HeadOnlyAccordionItem = ({ title }: Pick<AccordionItemProperties, "title">): JSX.Element => (
    <div
        data-testid="HeadOnly_Accordion__item"
        className="select-none"
    >
        <div
            data-testid="HeadOnly_Accordion__item-header"
            className="group pointer-events-none"
        >
            <div className="transition-default mb mx-2 my-1.5 flex min-w-0 items-center rounded-xl p-2 group-hover:bg-theme-secondary-100 sm:mx-3 sm:p-3">
                <div className="min-w-0 flex-1">{title}</div>
            </div>
        </div>
    </div>
);

export const Accordion = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <div
        data-testid="Accordion"
        className="divide-y divide-theme-secondary-300 rounded-xl border border-theme-secondary-300 py-2 dark:divide-theme-dark-700 dark:border-theme-dark-700"
    >
        {children}
    </div>
);
