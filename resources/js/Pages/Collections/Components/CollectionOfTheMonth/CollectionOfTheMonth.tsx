import React from "react";
import { useTranslation } from "react-i18next";
import { VoteCollection } from "./VoteCollection";

export const CollectionOfTheMonth = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="mt-12 flex w-full flex-col gap-4 px-6 sm:px-8 xl:flex-row xl:px-0">
            <VoteCollection />
            {/** NOTE: Remove this when working on ranking */}
            <div className="w-full xl:w-[420px]">{t("pages.collections.vote.vote_for_top_collection")} ranking</div>
        </div>
    );
};
