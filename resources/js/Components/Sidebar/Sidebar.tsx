import { type SidebarProperties } from "./Sidebar.contracts";
import { SidebarHead } from "./SidebarHead";

export const Sidebar = ({ children, title, subtitle }: SidebarProperties): JSX.Element => (
    <nav
        aria-label="Sidebar Navigation"
        data-testid="Sidebar"
    >
        <div className="rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700">
            <SidebarHead
                className="p-6"
                title={title}
                subtitle={subtitle}
            />

            <ul className="mt-0.5 flex flex-col space-x-0 space-y-1 px-3 pb-3 pt-1">{children}</ul>
        </div>
    </nav>
);
