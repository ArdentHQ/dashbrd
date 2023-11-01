import { Icon } from "@/Components/Icon";
import { isTruthy } from "@/Utils/is-truthy";

export const GalleryDraftStatus = ({
    draftId,
    isSavingDraft,
}: {
    draftId?: number;
    isSavingDraft?: boolean;
}): JSX.Element => {
    if (isTruthy(draftId) && isSavingDraft === false) {
        return (
            <div className="flex items-center">
                <Icon
                    size="lg"
                    name="FatDoubleCheck"
                    className="text-theme-secondary-700"
                />
                <div className="ml-2 hidden text-sm font-medium leading-5.5 text-theme-secondary-700 xs:block">
                    Draft Saved
                </div>
            </div>
        );
    }

    if (isSavingDraft === true) {
        return (
            <div className="flex items-center">
                <Icon
                    size="lg"
                    name="Refresh"
                    className="text-theme-secondary-700 dark:text-theme-dark-200"
                />
                <div className="ml-2 hidden text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 xs:block">
                    Saving to draft
                </div>
            </div>
        );
    }

    return <></>;
};
