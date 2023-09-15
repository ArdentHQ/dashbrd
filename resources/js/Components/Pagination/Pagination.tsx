import { router } from "@inertiajs/react";
import { type FormEvent, useMemo, useState } from "react";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { IconButton } from "@/Components/Buttons/IconButton";
import { Ellipsis } from "@/Components/Pagination/Ellipsis";
import { MobileButton } from "@/Components/Pagination/MobileButton";
import { NextPageLink } from "@/Components/Pagination/NextPageLink";
import { PageInput } from "@/Components/Pagination/PageInput";
import { PageLink } from "@/Components/Pagination/PageLink";
import { type PaginationProperties } from "@/Components/Pagination/Pagination.contracts";
import { PreviousPageLink } from "@/Components/Pagination/PreviousPageLink";

export const Pagination = <T,>({ data, ...properties }: PaginationProperties<T>): JSX.Element => {
    const [showInput, setShowInput] = useState(false);
    const [page, setPage] = useState(data.meta.current_page.toString());

    const pageAsNumber = useMemo(() => (page.length === 0 ? data.meta.current_page : Number(page)), [page]);

    const totalPages = data.meta.last_page;

    const buildPageLink = (page: string | number): string => {
        const query = new URLSearchParams(window.location.search);

        query.set("page", page.toString());

        return `${data.meta.path}?${query.toString()}`;
    };

    const goToPage = (event: FormEvent): void => {
        event.preventDefault();

        if (pageAsNumber <= totalPages) {
            router.get(buildPageLink(page));
        }
    };

    const showBeforeEllipsis = useMemo(() => data.meta.current_page >= 3 && data.meta.last_page > 3, [data]);
    const showAfterEllipsis = useMemo(
        () => data.meta.current_page + 2 <= data.meta.last_page && data.meta.last_page > 3,
        [data],
    );

    const pages = useMemo(() => {
        const pages: number[] = [];

        if (data.meta.current_page === data.meta.last_page && data.meta.current_page >= 3) {
            pages.push(data.meta.current_page - 2);
        }

        if (data.meta.current_page > 1) {
            pages.push(data.meta.current_page - 1);
        }

        pages.push(data.meta.current_page);

        if (data.meta.current_page + 1 <= data.meta.last_page) {
            pages.push(data.meta.current_page + 1);
        }

        if (data.meta.current_page === 1 && data.meta.last_page >= 3) {
            pages.push(data.meta.current_page + 2);
        }

        return pages;
    }, [data]);

    if (pages.length < 2) {
        return <></>;
    }

    const handleClick = (): void => {
        setShowInput(true);
        setPage(data.meta.current_page.toString());
    };

    return (
        <nav
            aria-label="Pagination"
            data-testid="Pagination"
            className="!m-0 w-full sm:w-fit"
            {...properties}
        >
            {showInput ? (
                <PageInput
                    currentPage={page}
                    totalPages={totalPages}
                    onSubmit={goToPage}
                    onChange={setPage}
                    onClose={() => {
                        setShowInput(false);
                        setPage(data.meta.current_page.toString());
                    }}
                />
            ) : (
                <>
                    <div className="mt-3 hidden items-center space-x-3 xs:flex sm:mt-0 sm:w-fit">
                        {data.meta.current_page > 1 && (
                            <ButtonLink
                                href={data.meta.first_page_url}
                                variant="icon"
                                icon="DoubleChevronLeftSmall"
                                data-testid="Pagination__firstPageLink"
                            />
                        )}

                        {data.meta.prev_page_url !== null && <PreviousPageLink href={data.meta.prev_page_url} />}

                        <div className="flex items-center space-x-0.5">
                            {showBeforeEllipsis && (
                                <button
                                    type="button"
                                    className="transition-default flex h-10 w-10 items-center space-x-4 rounded-full text-theme-secondary-700 outline-none ring-[3px] ring-transparent hover:bg-theme-secondary-300 focus-visible:ring-theme-hint-300"
                                    data-testid="Pagination__EllipsisButton"
                                    onClick={() => {
                                        setShowInput(true);
                                    }}
                                >
                                    <Ellipsis />
                                </button>
                            )}

                            {pages.map((page, index) => (
                                <PageLink
                                    key={index}
                                    page={page}
                                    isActive={data.meta.current_page === page}
                                    href={buildPageLink(page)}
                                />
                            ))}

                            {showAfterEllipsis && (
                                <button
                                    type="button"
                                    className="transition-default flex h-10 w-10 items-center space-x-4 rounded-full text-theme-secondary-700 outline-none ring-[3px] ring-transparent hover:bg-theme-secondary-300 focus-visible:ring-theme-hint-300"
                                    data-testid="Pagination__EllipsisButton__after"
                                    onClick={() => {
                                        setShowInput(true);
                                    }}
                                >
                                    <Ellipsis />
                                </button>
                            )}
                        </div>

                        <NextPageLink href={data.meta.next_page_url ?? null} />

                        {data.meta.current_page !== data.meta.last_page && (
                            <ButtonLink
                                href={data.meta.last_page_url}
                                variant="icon"
                                icon="DoubleChevronRightSmall"
                                data-testid="Pagination__lastPageLink"
                            />
                        )}
                    </div>

                    <div className="mt-3 px-3 xs:hidden">
                        <div className="flex w-full flex-col items-center gap-3">
                            <MobileButton
                                page={pageAsNumber}
                                totalPages={totalPages}
                                onClick={handleClick}
                            />

                            <div className="flex w-full flex-row items-center justify-between">
                                <ButtonLink
                                    href={data.meta.first_page_url}
                                    variant="icon"
                                    icon="DoubleChevronLeftSmall"
                                    data-testid="Pagination__firstPageLink"
                                    disabled={data.meta.current_page === 1}
                                />

                                <PreviousPageLink href={data.meta.prev_page_url} />

                                <IconButton
                                    icon="MagnifyingGlass"
                                    data-testid="Pagination__search"
                                    onClick={handleClick}
                                />

                                <NextPageLink href={data.meta.next_page_url} />

                                <ButtonLink
                                    href={data.meta.last_page_url}
                                    variant="icon"
                                    icon="DoubleChevronRightSmall"
                                    data-testid="Pagination__lastPageLink"
                                    disabled={data.meta.current_page === data.meta.last_page}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};
