import cn from "classnames";
import { type SidebarHeadProperties } from "./Sidebar.contracts";
import { Heading } from "@/Components/Heading";
import { isTruthy } from "@/Utils/is-truthy";

export const SidebarHead = ({ title, subtitle, className }: SidebarHeadProperties): JSX.Element => {
    if (!isTruthy(title) && !isTruthy(subtitle)) {
        return <></>;
    }

    return (
        <div
            className={cn("rounded-t-xl xl:bg-theme-secondary-50", className)}
            data-testid="SidebarHead"
        >
            {isTruthy(title) && (
                <div>
                    <Heading level={2}>{title}</Heading>
                </div>
            )}

            {isTruthy(subtitle) && <p className="mt-1 text-sm font-medium text-theme-secondary-700">{subtitle}</p>}
        </div>
    );
};
