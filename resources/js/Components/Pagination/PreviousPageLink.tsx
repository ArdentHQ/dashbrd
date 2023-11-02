import { ButtonLink, type ButtonLinkOnClick } from "@/Components/Buttons/ButtonLink";

export const PreviousPageLink = ({
    href,
    onClick,
}: {
    href: string | null;
    onClick?: ButtonLinkOnClick;
}): JSX.Element => (
    <ButtonLink
        onClick={onClick}
        disabled={href === null}
        href={href ?? "#"}
        variant="icon"
        icon="ChevronLeftSmall"
        data-testid="Pagination__PreviousPageLink__link"
        iconSize="xs"
    />
);
