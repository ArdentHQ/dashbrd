import React from "react";
import { useTranslation } from "react-i18next";
import { VoteCountdown } from "./VoteCountdown";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { LinkButton } from "@/Components/Link";

export const VoteCollection = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex w-full min-w-0 flex-col gap-4 rounded-xl border-theme-secondary-300 p-0 dark:border-theme-dark-700 lg:border lg:p-8">
            <Heading level={2}>{t("pages.collections.vote.vote_for_top_collection")}</Heading>

            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-2.5">
                <div className="max-w-full flex-1 space-y-2">
                    <Item />
                    <Item />
                    <Item />
                    <Item />
                </div>
                <div className="hidden flex-1 space-y-2 sm:block">
                    <Item />
                    <Item />
                    <Item />
                    <Item />
                </div>
            </div>

            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <VoteCountdown />

                <LinkButton
                    onClick={(): void => {
                        console.log("TODO: Implement or nominate collection");
                    }}
                    variant="link"
                    className="font-medium leading-6 dark:hover:decoration-theme-primary-400"
                    fontSize="!text-base"
                    textColor="!text-theme-primary-600 dark:!text-theme-primary-400"
                >
                    {t("pages.collections.vote.or_nominate_collection")}
                </LinkButton>
            </div>
        </div>
    );
};

const Item = () => (
    <div className="cursor-pointer rounded-lg border border-theme-secondary-300 px-4 py-3 hover:outline hover:outline-theme-hint-100 dark:border-theme-dark-700 dark:hover:outline-theme-dark-500">
        <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 space-x-3">
                <div className="flex">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-theme-secondary-100 dark:bg-theme-vote-background md:h-12 md:w-12">
                        <span className="font-medium text-theme-secondary-700 dark:text-theme-dark-200">1</span>
                    </div>
                    <div className="relative -ml-2 h-12 w-12 shrink-0">
                        <Img
                            wrapperClassName="aspect-square"
                            className="h-full w-full rounded-full rounded-full bg-white object-cover ring-4 ring-white dark:bg-theme-dark-700 dark:ring-theme-dark-700"
                            isCircle
                            src="https://i.seadn.io/gcs/files/4ef4a60496c335d66eba069423c0af90.png?w=500&auto=format"
                        />
                    </div>
                </div>

                <div className="break-word-legacy min-w-0 space-y-0.5 ">
                    <p
                        data-testid="CollectionName__name"
                        className="truncate text-base font-medium text-theme-secondary-900 dark:text-theme-dark-50 md-lg:text-base"
                    >
                        AlphaDogs AlphaDogs AlphaDogsAlphaDogs AlphaDogs AlphaDogs
                    </p>
                    <p className="hidden text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block">
                        3.55 ETH
                    </p>
                    <div className="md-lg:hidden">
                        <VoteCount />
                    </div>
                </div>
            </div>

            <div className="ml-2 hidden md-lg:block">
                <VoteCount />
            </div>
        </div>
    </div>
);

const VoteCount = () => (
    <div className="flex items-center space-x-2">
        <p className="text-sm font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-6">
            Votes
        </p>
        <Icon
            name="HiddenVote"
            size="2xl"
        />
    </div>
);
