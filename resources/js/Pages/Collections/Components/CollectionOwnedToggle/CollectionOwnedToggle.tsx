import { useTranslation } from "react-i18next";
import { Toggle } from "@/Components/Form/Toggle";

export const CollectionOwnedToggle = ({
    ownedNftsCount,
    checked,
    onChange,
}: {
    ownedNftsCount: number;
    checked: boolean;
    onChange: (checked: boolean) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between rounded-xl border border-theme-secondary-300 px-6 py-4">
            <div className="flex items-center space-x-2">
                <span className="font-medium text-theme-secondary-900">
                    {t("pages.collections.show_my_collection")}
                </span>

                <span className="flex h-6.5 items-center justify-center rounded-full bg-theme-secondary-100 px-2.5 py-0.5 font-medium text-theme-secondary-700">
                    {ownedNftsCount >= 100 ? "99+" : ownedNftsCount}
                </span>
            </div>

            <Toggle
                className="ml-auto"
                checked={checked}
                onChange={onChange}
            />
        </div>
    );
};
