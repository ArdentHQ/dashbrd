import React from "react";
import { ErrorBlock, type ErrorBlockProperties } from "./ErrorBlock";
import * as useDarkModeContext from "@/Contexts/DarkModeContex";
import { render, screen } from "@/Tests/testing-library";

describe("ErrorBlock", () => {
    beforeAll(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render 500 error", () => {
        render(
            <ErrorBlock
                statusCode={500}
                contactEmail="test@email.com"
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getAllByTestId("ButtonLink--anchor")).toHaveLength(2);
    });

    it("should not render contact button if email is not provided", () => {
        render(
            <ErrorBlock
                statusCode={500}
                contactEmail=""
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getAllByTestId("ButtonLink--anchor")).toHaveLength(1);
    });

    it("should render 503 error", () => {
        render(
            <ErrorBlock
                statusCode={503}
                contactEmail=""
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getByText("Dashbrd is currently down for scheduled maintenance.")).toBeInTheDocument();
    });

    it.each([401, 403, 404, 419, 429, 500, 503] as Array<ErrorBlockProperties["statusCode"]>)(
        "should render light image for error %s if dark mode is disabled",
        (statusCode) => {
            render(
                <ErrorBlock
                    statusCode={statusCode}
                    contactEmail=""
                />,
            );

            expect(screen.getByTestId(`Error__Image${statusCode}Light`)).toBeInTheDocument();
        },
    );

    it.each([401, 403, 404, 419, 429, 500, 503] as Array<ErrorBlockProperties["statusCode"]>)(
        "should render alt image for error %s if dark mode is active",
        (statusCode) => {
            vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({
                isDark: true,
                toggleDarkMode: vi.fn(),
            });

            render(
                <ErrorBlock
                    statusCode={statusCode}
                    contactEmail=""
                />,
            );

            expect(screen.getByTestId(`Error__Image${statusCode}Dark`)).toBeInTheDocument();
        },
    );
});
