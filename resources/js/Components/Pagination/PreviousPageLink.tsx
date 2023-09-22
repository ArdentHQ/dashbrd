import { ButtonLink } from "@/Components/Buttons/ButtonLink";

export const PreviousPageLink = ({ href }: { href: string | null }): JSX.Element => (
    <ButtonLink
        disabled={href === null}
        href={href ?? "#"}
        variant="icon"
        icon="ChevronLeftSmall"
        data-testid="Pagination__PreviousPageLink__link"
        iconSize="xs"
    />
);
