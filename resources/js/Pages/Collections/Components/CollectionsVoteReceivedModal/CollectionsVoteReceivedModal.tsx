import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Dialog } from "@/Components/Dialog";
import { isTruthy } from "@/Utils/is-truthy";

export const CollectionsVoteReceivedModal = ({
    onClose,
    collection,
}: {
    onClose: () => void;
    collection?: {
        name: string;
        slug: string;
    };
}): JSX.Element => {
    const { t } = useTranslation();

    const twitterUrl = (collection?: { name: string; slug: string }): string => {
        if (!isTruthy(collection)) {
            return "";
        }

        const url = new URL("https://twitter.com/intent/tweet");

        url.searchParams.set(
            "text",
            t("pages.collections.collection_of_the_month.vote_received_modal.x_text", { collection: collection.name }),
        );
        url.searchParams.set("url", route("collections.view", { slug: collection.slug }));

        return url.toString();
    };

    return (
        <Dialog
            isOpen={collection !== undefined}
            onClose={onClose}
            title={t("pages.collections.collection_of_the_month.vote_received_modal.title")}
            panelClassName="md:max-w-none md:w-[648px]"
            footer={
                <div className="mb-6 border-t border-theme-secondary-300 px-6 pt-4 dark:border-theme-dark-700">
                    <ButtonLink
                        href={twitterUrl()}
                        target="_blank"
                        variant="primary"
                        className="w-full justify-center"
                        icon="Twitter"
                        iconPosition="right"
                    >
                        {t("pages.collections.collection_of_the_month.vote_received_modal.share_vote")}
                    </ButtonLink>
                </div>
            }
        >
            <p className="text-theme-secondary-700 dark:text-theme-dark-200">
                {t("pages.collections.collection_of_the_month.vote_received_modal.description")}
            </p>
            <div className="mt-3">
                <img
                    className="h-auto w-full rounded-lg"
                    srcSet={`/images/collections/voted.png 1x, /images/collections/voted@2x.png 2x`}
                    src="/images/collections/voted.png"
                    alt={t("pages.collections.collection_of_the_month.vote_received_modal.img_alt")}
                />
            </div>
        </Dialog>
    );
};
