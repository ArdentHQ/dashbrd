import { type FormEvent, type HTMLAttributes } from "react";
import { type ButtonLinkOnClick } from "@/Components/Buttons/ButtonLink";

export interface MobileButtonProperties extends HTMLAttributes<HTMLButtonElement> {
    page: number;
    totalPages: number;
}

export interface PageLinkProperties {
    href: string;
    page: number;
    isActive?: boolean;
    onClick?: ButtonLinkOnClick;
}

export interface PageInputProperties {
    onSubmit: (event: FormEvent) => void;
    onChange: (page: string) => void;
    onClose: () => void;
    totalPages: number;
}

export interface PaginationData<T> {
    data: T[];
    links: Array<{
        url: string | null;
        active: boolean;
        label: string;
    }>;
    meta: {
        current_page: number;
        first_page_url: string;
        from: number | null;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number | null;
        total: number;
    };
}

export interface PaginationProperties<T> extends HTMLAttributes<HTMLDivElement> {
    responsiveBreakpoint?: "xs" | "sm" | "md" | "lg";
    data: PaginationData<T>;
    onPageChange?: (page: number) => void;
}
