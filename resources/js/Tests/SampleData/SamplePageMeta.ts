import { appUrl } from "@/Utils/app";

export const baseUrl = `${appUrl()}/api`;

export const SamplePageMeta = {
    paginated: {
        links: [
            {
                url: baseUrl,
                label: "test",
                active: true,
            },
        ],
        meta: {
            current_page: 1,
            first_page_url: baseUrl,
            from: 1,
            last_page: 2,
            last_page_url: baseUrl,
            next_page_url: baseUrl,
            path: "test",
            per_page: 10,
            prev_page_url: null,
            to: 1,
            total: 10,
        },
    },
};

export const SampleLastPageMeta = {
    paginated: {
        links: [
            {
                url: baseUrl,
                label: "test",
                active: true,
            },
        ],
        meta: {
            current_page: 1,
            first_page_url: baseUrl,
            from: 1,
            last_page: 1,
            last_page_url: baseUrl,
            next_page_url: null,
            path: "test",
            per_page: 10,
            prev_page_url: null,
            to: 1,
            total: 10,
        },
    },
};
