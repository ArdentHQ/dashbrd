import { Link } from "@inertiajs/react";
import cn from "classnames";

interface Properties {
    href: string;
    active: boolean;
    children: React.ReactNode;
}

export const NavLink = ({ href, active, children }: Properties): JSX.Element => (
    <Link
        data-testid="NavLink"
        href={href}
        className={cn(
            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none",
            {
                "border-indigo-400 focus:border-indigo-700 text-theme-secondary-900": active,
                "border-transparent text-theme-secondary-500 hover:border-theme-secondary-300 hover:text-theme-secondary-700 focus:border-theme-secondary-300 focus:text-theme-secondary-700":
                    !active,
            },
        )}
    >
        {children}
    </Link>
);
