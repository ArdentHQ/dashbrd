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

export const Pagination = <T,>({ data, onPageChange, ...properties }: PaginationProperties<T>): JSX.Element => {
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
            onPageChange !== undefined ? onPageChange(Number(page)) : router.get(buildPageLink(page));
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

    const handlePageChange = (
        event: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>,
        page: number,
    ): void => {
        /* istanbul ignore next -- @preserve */
        if (onPageChange !== undefined) {
            event.preventDefault();
            onPageChange(page);
        }
    };

    return (
        <nav
            aria-label="Pagination"
            data-testid="Pagination"
            className="w-full sm:w-fit"
            {...properties}
        >
            <div className="mt-3 xs:hidden">
                <MobileButton
                    page={pageAsNumber}
                    totalPages={totalPages}
                    onClick={handleClick}
                />
            </div>

            {showInput ? (
                <PageInput
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
                    <div className="mt-3 hidden items-center space-x-3 xs:flex xs:space-x-1 sm:w-fit  md:mt-0 ">
                        {data.meta.current_page > 1 && (
                            <ButtonLink
                                onClick={(event) => {
                                    handlePageChange(event, 1);
                                }}
                                href={data.meta.first_page_url}
                                variant="icon"
                                icon="DoubleChevronLeftSmall"
                                data-testid="Pagination__firstPageLink"
                                iconSize="xs"
                            />
                        )}
                        {data.meta.prev_page_url !== null && (
                            <PreviousPageLink
                                onClick={(event) => {
                                    handlePageChange(event, data.meta.current_page - 1);
                                }}
                                href={data.meta.prev_page_url}
                            />
                        )}
                        <div className="flex items-center space-x-0.5">
                            {showBeforeEllipsis && (
                                <button
                                    type="button"
                                    className="transition-default flex h-10 w-10 items-center space-x-4 rounded-full text-theme-secondary-700 outline-none ring-[3px] ring-transparent hover:bg-theme-secondary-300 focus-visible:ring-theme-primary-300 dark:text-theme-dark-200 dark:hover:bg-theme-dark-800 dark:focus-visible:ring-theme-dark-800"
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
                                    onClick={(event) => {
                                        handlePageChange(event, page);
                                    }}
                                    key={index}
                                    page={page}
                                    isActive={data.meta.current_page === page}
                                    href={buildPageLink(page)}
                                />
                            ))}

                            {showAfterEllipsis && (
                                <button
                                    type="button"
                                    className="transition-default flex h-10 w-10 items-center space-x-4 rounded-full text-theme-secondary-700 outline-none ring-[3px] ring-transparent hover:bg-theme-secondary-300 focus-visible:ring-theme-primary-300 dark:text-theme-dark-200 dark:hover:bg-theme-dark-800 dark:focus-visible:ring-theme-dark-800"
                                    data-testid="Pagination__EllipsisButton__after"
                                    onClick={() => {
                                        setShowInput(true);
                                    }}
                                >
                                    <Ellipsis />
                                </button>
                            )}
                        </div>
                        {data.meta.next_page_url !== null && (
                            <NextPageLink
                                onClick={(event) => {
                                    handlePageChange(event, data.meta.current_page + 1);
                                }}
                                href={data.meta.next_page_url}
                            />
                        )}
                        {data.meta.current_page !== data.meta.last_page && (
                            <ButtonLink
                                onClick={(event) => {
                                    handlePageChange(event, data.meta.last_page);
                                }}
                                href={data.meta.last_page_url}
                                variant="icon"
                                icon="DoubleChevronRightSmall"
                                data-testid="Pagination__lastPageLink"
                                iconSize="xs"
                            />
                        )}
                    </div>

                    <div className="mt-3 xs:hidden">
                        <div className="flex w-full flex-col items-center gap-3">
                            <div className="flex w-full flex-row items-center justify-between">
                                <ButtonLink
                                    onClick={(event) => {
                                        handlePageChange(event, 1);
                                    }}
                                    href={data.meta.first_page_url}
                                    variant="icon"
                                    icon="DoubleChevronLeftSmall"
                                    data-testid="Pagination__firstPageLink_mobile"
                                    disabled={data.meta.current_page === 1}
                                    iconSize="xs"
                                />

                                <PreviousPageLink
                                    onClick={(event) => {
                                        handlePageChange(event, data.meta.current_page - 1);
                                    }}
                                    href={data.meta.prev_page_url}
                                />

                                <IconButton
                                    icon="MagnifyingGlass"
                                    data-testid="Pagination__search"
                                    onClick={handleClick}
                                />

                                <NextPageLink
                                    onClick={(event) => {
                                        handlePageChange(event, data.meta.current_page + 1);
                                    }}
                                    href={data.meta.next_page_url}
                                />

                                <ButtonLink
                                    onClick={(event) => {
                                        handlePageChange(event, data.meta.last_page);
                                    }}
                                    href={data.meta.last_page_url}
                                    variant="icon"
                                    icon="DoubleChevronRightSmall"
                                    data-testid="Pagination__lastPageLink_mobile"
                                    disabled={data.meta.current_page === data.meta.last_page}
                                    iconSize="xs"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};
