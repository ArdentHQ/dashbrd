import { router } from "@inertiajs/react";
import React from "react";
import { expect } from "vitest";
import { Pagination } from "@/Components/Pagination";
import { fireEvent, render, screen, waitFor } from "@/Tests/testing-library";

const paginationData = {
    data: [
        { id: "1", name: "John Doe", email: "john@example.com" },
        { id: "2", name: "Jane Doe", email: "jane@example.com" },
        { id: "3", name: "Steve Doe", email: "steve@example.com" },
        { id: "4", name: "Bob Doe", email: "bob@example.com" },
        { id: "5", name: "Alice Doe", email: "alice@example.com" },
    ],
    links: [
        { url: null, label: "&laquo; Previous", active: false },
        { url: "http://dashbrd.test?page=1", label: "1", active: true },
        { url: "http://dashbrd.test?page=2", label: "2", active: false },
        { url: "http://dashbrd.test?page=3", label: "3", active: false },
        { url: "http://dashbrd.test?page=2", label: "Next &raquo;", active: false },
    ],
    meta: {
        current_page: 1,
        first_page_url: "http://dashbrd.test?page=1",
        from: 1,
        last_page: 3,
        last_page_url: "http://dashbrd.test?page=3",
        next_page_url: "http://dashbrd.test?page=2",
        path: "http://dashbrd.test",
        per_page: 5,
        prev_page_url: null,
        to: 5,
        total: 15,
    },
};

describe("Pagination", () => {
    it("should render", () => {
        render(<Pagination data={paginationData} />);

        expect(screen.getByTestId("Pagination")).toBeInTheDocument();
    });

    it("can show mobile input when button is pressed", async () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();
        });
    });

    it("defaults to current page number on a mobile button if no page is entered into the input", async () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();
        });

        const input = screen.getByTestId("Pagination__PageInput__input");

        fireEvent.change(input, {
            target: {
                value: "",
            },
        });

        expect(button.textContent).toBe("Page 1 of 3");
    });

    it("can show input when 'before' ellipsis button is pressed", async () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 4,
                last_page: 10,
            },
        };

        render(<Pagination data={data} />);

        const button = screen.getByTestId("Pagination__EllipsisButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();

            expect(screen.queryByTestId("Pagination__EllipsisButton")).not.toBeInTheDocument();
        });
    });

    it("can show input when 'after' ellipsis button is pressed", async () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 4,
                last_page: 10,
            },
        };

        render(<Pagination data={data} />);

        const button = screen.getByTestId("Pagination__EllipsisButton__after");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();

            expect(screen.queryByTestId("Pagination__EllipsisButton__after")).not.toBeInTheDocument();
        });
    });

    it("can navigate to a specific page from a mobile input", async () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "get").mockImplementation(function_);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();

            const input = screen.getByTestId("Pagination__PageInput__input");

            fireEvent.change(input, {
                target: {
                    value: "2",
                },
            });

            const form = screen.getByTestId("Pagination__PageInput__form");

            fireEvent.submit(form);

            expect(routerSpy).toBeCalledTimes(1);
        });
    });

    it("does not navigate if entered page number is greater than total number of pages", async () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "get").mockImplementation(function_);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();

            const input = screen.getByTestId("Pagination__PageInput__input");

            fireEvent.change(input, {
                target: {
                    value: "20",
                },
            });

            const form = screen.getByTestId("Pagination__PageInput__form");

            fireEvent.submit(form);

            expect(routerSpy).toBeCalledTimes(0);
        });
    });

    it("can close page input", async () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");

        expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId("Pagination__PageInput__closeButton");

        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId("Pagination__PageInput__input")).not.toBeInTheDocument();
        });
    });

    it("doesn't show first page button if on first page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 1,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination__firstPageLink")).not.toBeInTheDocument();
    });

    it("shows first page link if not on first page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 2,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__firstPageLink")).toBeInTheDocument();
        expect(screen.getByTestId("Pagination__firstPageLink_mobile")).toBeInTheDocument();
    });

    it("doesn't show last page button if on last page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: paginationData.meta.last_page,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination__lastPageLink")).not.toBeInTheDocument();
    });

    it("shows first page link if not on first page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: paginationData.meta.last_page - 1,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__lastPageLink")).toBeInTheDocument();
        expect(screen.getByTestId("Pagination__lastPageLink_mobile")).toBeInTheDocument();
    });

    it("shows previous page url if there is a previous page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                prev_page_url: "https://example.com",
            },
        };

        render(<Pagination data={data} />);

        for (const link of screen.getAllByTestId("Pagination__PreviousPageLink__link")) {
            expect(link).toBeInTheDocument();
        }
    });

    it("show disabled previous page button if there is no previous page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                prev_page_url: null,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__PreviousPageLink__link")).toBeInTheDocument();
        expect(screen.getByTestId("Pagination__PreviousPageLink__link")).toHaveAttribute("disabled");
    });

    it("shows next page url if there is a next page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                next_page_url: "https://example.com",
            },
        };

        render(<Pagination data={data} />);

        for (const link of screen.getAllByTestId("Pagination__NextPageLink__link")) {
            expect(link).toBeInTheDocument();
        }
    });

    it("should show a disabled next page url if there is no next page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                next_page_url: null,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__NextPageLink__link")).toBeInTheDocument();
        expect(screen.getByTestId("Pagination__NextPageLink__link")).toHaveAttribute("disabled");
    });

    it("shows 'before' ellipsis if there are more than 3 pages and user is browsing page larger than 3", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 1,
                last_page: 4,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__Ellipsis")).toBeInTheDocument();
    });

    it("does not show 'before' or 'after' ellipsises if there are less than 3 pages", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                last_page: 2,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination__Ellipsis")).not.toBeInTheDocument();
    });

    it("does not show 'before' or 'after' ellipsis if user is browsing first or second page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 1,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination__Ellipsis")).not.toBeInTheDocument();
    });

    it("shows 'before' ellipsis if there are more than 3 pages and user is browsing page larger than 3", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 1,
                last_page: 4,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.getByTestId("Pagination__Ellipsis")).toBeInTheDocument();
    });

    it("does not show 'before' ellipsis if user is browsing first or second page", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 1,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination__Ellipsis")).not.toBeInTheDocument();
    });

    it("shows 'after' ellipsis if there are more than 2 pages left to browse", () => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                current_page: 4,
                last_page: 7,
            },
        };

        render(<Pagination data={data} />);

        for (const element of screen.getAllByTestId("Pagination__Ellipsis")) {
            expect(element).toBeInTheDocument();
        }
    });

    it("should not render pagination for only one page", () => {
        const data = {
            data: [{ id: "0", name: "John Doe", email: "john@example.com" }],

            links: [
                { url: null, label: "&laquo; Previous", active: false },
                { url: "http://dashbrd.test?page=1", label: "1", active: true },
            ],
            meta: {
                current_page: 1,
                first_page_url: "http://dashbrd.test?page=1",
                from: 1,
                last_page: 1,
                last_page_url: "http://dashbrd.test?page=1",
                next_page_url: "http://dashbrd.test?page=1",
                path: "http://dashbrd.test",
                per_page: 5,
                prev_page_url: null,
                to: 5,
                total: 15,
            },
        };

        render(<Pagination data={data} />);

        expect(screen.queryByTestId("Pagination")).not.toBeInTheDocument();
    });

    it("should set page as currentPage in input if page is not provided on edit", () => {
        render(<Pagination data={paginationData} />);

        const button = screen.getByTestId("Pagination__MobileButton");
        fireEvent.click(button);

        const input = screen.getByTestId("Pagination__PageInput__input");

        fireEvent.change(input, {
            target: {
                value: "2",
            },
        });

        expect(button.textContent).toBe("Page 2 of 3");

        fireEvent.click(button);
        fireEvent.change(input, {
            target: {
                value: null,
            },
        });
        expect(button.textContent).toBe("Page 1 of 3");

        fireEvent.click(button);
        fireEvent.change(input, {
            target: {
                value: "",
            },
        });
        expect(button.textContent).toBe("Page 1 of 3");
    });

    it.each([
        [{ first_page_url: "example.com", current_page: 2 }, "Pagination__firstPageLink", 1],
        [{ first_page_url: "example.com", current_page: 2 }, "Pagination__firstPageLink_mobile", 1],
        [{ prev_page_url: "example.com", current_page: 2 }, "Pagination__PreviousPageLink__link", 1],
        [{ next_page_url: "example.com", current_page: 1 }, "Pagination__NextPageLink__link", 2],
        [{ last_page_url: "example.com", current_page: 2 }, "Pagination__lastPageLink", 3],
        [{ last_page_url: "example.com", current_page: 2 }, "Pagination__lastPageLink_mobile", 3],
    ])("should trigger page change", (meta, testId, page) => {
        const data = {
            ...paginationData,
            meta: {
                ...paginationData.meta,
                ...meta,
            },
        };

        const onPageChangeMock = vi.fn();

        render(
            <Pagination
                data={data}
                onPageChange={onPageChangeMock}
            />,
        );

        const elements = screen.getAllByTestId(testId);

        for (const element of elements) {
            fireEvent.click(element);
        }

        expect(onPageChangeMock).toBeCalledTimes(elements.length);
        expect(onPageChangeMock).toBeCalledWith(page);
    });
});
