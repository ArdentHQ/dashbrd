import { Pagination } from "@/Components/Pagination";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default {
    title: "Base/Pagination",
    component: Pagination,
};

export const OnFirstPage = () => (
    <Pagination
        className="flex w-full items-center justify-center"
        data={{
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
        }}
    />
);

export const OnFirstPageManyPages = () => (
    <Pagination
        className="flex w-full items-center justify-center"
        data={{
            data: [
                {
                    id: 1,
                    user_id: 1,
                    name: "My Own Collection",
                    cover_image: "https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840",
                    created_at: "2023-03-24T15:31:58.000000Z",
                    updated_at: "2023-03-24T15:31:58.000000Z",
                },
                {
                    id: 2,
                    user_id: 1,
                    name: "My Own Collection - Improved",
                    cover_image: "https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840",
                    created_at: "2023-03-24T15:31:58.000000Z",
                    updated_at: "2023-03-24T15:31:58.000000Z",
                },
                {
                    id: 3,
                    user_id: 1,
                    name: "I Like Cats",
                    cover_image: "https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840",
                    created_at: "2023-03-24T15:31:58.000000Z",
                    updated_at: "2023-03-24T15:31:58.000000Z",
                },
                {
                    id: 4,
                    user_id: 1,
                    name: "I Like Dogs",
                    cover_image: "https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840",
                    created_at: "2023-03-24T15:31:58.000000Z",
                    updated_at: "2023-03-24T15:31:58.000000Z",
                },
                {
                    id: 5,
                    user_id: 1,
                    name: "Teeny Tiny Collection",
                    cover_image: "https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840",
                    created_at: "2023-03-24T15:31:58.000000Z",
                    updated_at: "2023-03-24T15:31:58.000000Z",
                },
            ],
            meta: {
                current_page: 1,
                first_page_url: "http://dashbrd.test/pagination-test?page=1",
                from: 1,
                last_page: 17,
                last_page_url: "http://dashbrd.test/pagination-test?page=17",
                next_page_url: "http://dashbrd.test/pagination-test?page=2",
                path: "http://dashbrd.test/pagination-test",
                per_page: 5,
                prev_page_url: null,
                to: 5,
                total: 84,
            },
            links: [
                {
                    url: null,
                    label: "&laquo; Previous",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=1",
                    label: "1",
                    active: true,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=2",
                    label: "2",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=3",
                    label: "3",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=4",
                    label: "4",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=5",
                    label: "5",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=6",
                    label: "6",
                    active: false,
                },
                {
                    url: null,
                    label: "...",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=16",
                    label: "16",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=17",
                    label: "17",
                    active: false,
                },
                {
                    url: "http://dashbrd.test/pagination-test?page=2",
                    label: "Next &raquo;",
                    active: false,
                },
            ],
        }}
    />
);

export const OnLastPage = () => (
    <Pagination
        className="flex w-full items-center justify-center"
        data={{
            data: [
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "2", name: "Jane Doe", email: "jane@example.com" },
                { id: "3", name: "Steve Doe", email: "steve@example.com" },
                { id: "4", name: "Bob Doe", email: "bob@example.com" },
                { id: "5", name: "Alice Doe", email: "alice@example.com" },
            ],
            links: [
                { url: null, label: "&laquo; Previous", active: false },
                { url: "http://dashbrd.test?page=1", label: "1", active: false },
                { url: "http://dashbrd.test?page=2", label: "2", active: false },
                { url: "http://dashbrd.test?page=3", label: "3", active: true },
            ],
            meta: {
                current_page: 3,
                first_page_url: "http://dashbrd.test?page=1",
                from: 10,
                last_page: 3,
                last_page_url: "http://dashbrd.test?page=3",
                next_page_url: null,
                path: "http://dashbrd.test",
                per_page: 5,
                prev_page_url: "http://dashbrd.test?page=2",
                to: 15,
                total: 15,
            },
        }}
    />
);

export const OnLastPageManyPages = () => (
    <Pagination
        className="flex w-full items-center justify-center"
        data={{
            data: [
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "2", name: "Jane Doe", email: "jane@example.com" },
                { id: "3", name: "Steve Doe", email: "steve@example.com" },
                { id: "4", name: "Bob Doe", email: "bob@example.com" },
                { id: "5", name: "Alice Doe", email: "alice@example.com" },
            ],
            links: [
                { url: null, label: "&laquo; Previous", active: false },
                { url: "http://dashbrd.test?page=1", label: "1", active: false },
                { url: "http://dashbrd.test?page=2", label: "2", active: false },
                { url: "http://dashbrd.test?page=3", label: "3", active: true },
            ],
            meta: {
                current_page: 50,
                first_page_url: "http://dashbrd.test?page=1",
                from: 245,
                last_page: 50,
                last_page_url: "http://dashbrd.test?page=50",
                next_page_url: null,
                path: "http://dashbrd.test",
                per_page: 5,
                prev_page_url: "http://dashbrd.test?page=49",
                to: 250,
                total: 250,
            },
        }}
    />
);

export const MiddleManyPages = () => (
    <Pagination
        className="flex w-full items-center justify-center"
        data={{
            data: [
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "2", name: "Jane Doe", email: "jane@example.com" },
                { id: "3", name: "Steve Doe", email: "steve@example.com" },
                { id: "4", name: "Bob Doe", email: "bob@example.com" },
                { id: "5", name: "Alice Doe", email: "alice@example.com" },
            ],
            links: [
                { url: null, label: "&laquo; Previous", active: false },
                { url: "http://dashbrd.test?page=1", label: "1", active: false },
                { url: "http://dashbrd.test?page=2", label: "2", active: false },
                { url: "http://dashbrd.test?page=3", label: "3", active: true },
            ],
            meta: {
                current_page: 25,
                first_page_url: "http://dashbrd.test?page=1",
                from: 125,
                last_page: 50,
                last_page_url: "http://dashbrd.test?page=50",
                next_page_url: "http://dashbrd.test?page=26",
                path: "http://dashbrd.test",
                per_page: 5,
                prev_page_url: "http://dashbrd.test?page=24",
                to: 130,
                total: 250,
            },
        }}
    />
);

export const CustomPageLimitSelection = () => {
    const [value, setValue] = useState<string | number>();
    const { t } = useTranslation();

    return (
        <SelectPageLimit
            onChange={({ value }) => {
                setValue(value);
            }}
            value={value}
            suffix={t("common.records")}
        />
    );
};
