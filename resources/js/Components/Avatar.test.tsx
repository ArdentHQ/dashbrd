import React from "react";
import { Avatar } from "./Avatar";
import { render, screen } from "@/Tests/testing-library";

describe("Avatar", () => {
    it("should render", () => {
        const { asFragment } = render(<Avatar address="0x00" />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with custom avatar", () => {
        render(
            <Avatar
                address="0x00"
                avatar={{
                    default: "https://dashbrd.test/avatar.png",
                    small: "https://dashbrd.test/small.png",
                    small2x: "https://dashbrd.test/small2x.png",
                }}
            />,
        );

        const img = screen.getByTestId("Avatar__image");

        expect(img).toBeInTheDocument();

        expect(img).toHaveAttribute("src", "https://dashbrd.test/avatar.png");

        expect(img).toHaveAttribute("srcset", "https://dashbrd.test/small.png 1x, https://dashbrd.test/small2x.png 2x");
    });

    it("should render with avatar if no conversions yet", () => {
        render(
            <Avatar
                address="0x00"
                avatar={{
                    default: "https://dashbrd.test/avatar.png",
                    small: null,
                    small2x: null,
                }}
            />,
        );

        const img = screen.getByTestId("Avatar__image");

        expect(img).toBeInTheDocument();

        expect(img).toHaveAttribute("src", "https://dashbrd.test/avatar.png");

        expect(img).toHaveAttribute("srcset", "");
    });
});
