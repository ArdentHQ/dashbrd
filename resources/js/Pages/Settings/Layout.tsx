import { Head } from "@inertiajs/react";
import { type ReactNode } from "react";
import { SettingsListboxMenu } from "./Components/SettingsListboxMenu";
import { SettingsSidebar } from "./Components/SettingsSidebar";
import { LayoutWrapper } from "@/Components/Layout/LayoutWrapper";
import { type ToastMessage } from "@/Components/Toast";

const Layout = ({
    title,
    toastMessage,
    children,
    mustBeSigned = false,
    showBackButton,
}: {
    title: string;
    children: ReactNode;
    toastMessage?: ToastMessage;
    mustBeSigned?: boolean;
    showBackButton?: boolean;
}): JSX.Element => (
    <LayoutWrapper
        toastMessage={toastMessage}
        mustBeSigned={mustBeSigned}
        showBackButton={showBackButton}
    >
        <Head title={title} />

        <div className="block xl:hidden">
            <SettingsListboxMenu />
        </div>

        <div className="grid-cols-4 gap-6 sm:space-y-6 sm:px-8 xl:grid xl:space-y-0">
            <aside className="col-span-1">
                <div className="hidden xl:block">
                    <SettingsSidebar />
                </div>
            </aside>

            <section className="col-span-3">{children}</section>
        </div>
    </LayoutWrapper>
);

export default Layout;
