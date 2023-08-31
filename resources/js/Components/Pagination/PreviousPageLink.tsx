import { ButtonLink } from "@/Components/Buttons/ButtonLink";

export const PreviousPageLink = ({ href }: { href: string }): JSX.Element => (
    <ButtonLink
        href={href}
        variant="icon"
        icon="ChevronLeftSmall"
        data-testid="Pagination__PreviousPageLink__link"
    />
);
