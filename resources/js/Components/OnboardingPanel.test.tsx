import { OnboardingPanel } from "@/Components/OnboardingPanel";
import { render, screen } from "@/Tests/testing-library";

describe("OnboardingPanel", () => {
    it("should render", () => {
        render(
            <OnboardingPanel
                heading="Some Title"
                subheading="Hello World"
            />,
        );

        expect(screen.getByTestId("OnboardingPanel")).toBeInTheDocument();
    });
});
