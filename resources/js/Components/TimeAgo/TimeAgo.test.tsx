import { DateTime } from "@ardenthq/sdk-intl";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { TimeAgo } from "./TimeAgo";
import { render, screen } from "@/Tests/testing-library";
import { tp } from "@/Utils/TranslatePlural";

const baseTime = "2023-03-01T00:00:00.000Z";

describe("TimeAgo", () => {
    it("should render", () => {
        render(<TimeAgo date={DateTime.make().toISOString()} />);

        expect(screen.getByTestId("TimeAgo")).toBeInTheDocument();
    });

    it.each([
        ["years", DateTime.make(baseTime).subYear().toISOString(), "years_ago"],
        ["months", DateTime.make(baseTime).subMonth().toISOString(), "months_ago"],
        ["days", DateTime.make(baseTime).subDay().toISOString(), "days_ago"],
        ["hours", DateTime.make(baseTime).subHour().toISOString(), "hours_ago"],
        ["minutes", DateTime.make(baseTime).subMinute().toISOString(), "minutes_ago"],
    ])("should render the difference in %s", (_unit, date, key) => {
        render(<TimeAgo date={date} />);

        expect(screen.getByTestId("TimeAgo")).toHaveTextContent(tp(`common.datetime.${key}`, 1, { count: 1 }));
    });

    it("should render the fallback if the difference is less than a minute", () => {
        const { result } = renderHook(() => useTranslation());
        const { t } = result.current;

        render(<TimeAgo date={baseTime} />);

        expect(screen.getByTestId("TimeAgo")).toHaveTextContent(t("common.datetime.few_seconds_ago"));
    });
});
