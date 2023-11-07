import { ButtonLink, type ButtonLinkOnClick } from "@/Components/Buttons/ButtonLink";

export const NextPageLink = ({ href, onClick }: { href: string | null; onClick?: ButtonLinkOnClick }): JSX.Element => (
    <ButtonLink
        onClick={onClick}
        disabled={href == null}
        href={href ?? "#"}
        variant="icon"
        icon="ChevronRightSmall"
        data-testid="Pagination__NextPageLink__link"
        iconSize="xs"
    />
);
