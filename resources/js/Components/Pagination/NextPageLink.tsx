import { ButtonLink } from "@/Components/Buttons/ButtonLink";

export const NextPageLink = ({ href }: { href: string | null }): JSX.Element => (
    <ButtonLink
        disabled={href == null}
        href={href ?? "#"}
        variant="icon"
        icon="ChevronRightSmall"
        data-testid="Pagination__NextPageLink__link"
        iconSize="xs"
    />
);
