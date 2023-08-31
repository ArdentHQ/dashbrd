import { Icon } from "@/Components/Icon";

export const Ellipsis = (): JSX.Element => (
    <span
        className="flex h-10 w-10 items-center justify-center text-theme-secondary-700"
        data-testid="Pagination__Ellipsis"
    >
        <Icon name="Ellipsis" />
    </span>
);
