import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Img } from "@/Components/Image";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import {
    OneBarChart,
    OneBarChartDark,
    OneBarChartLg,
    OneBarChartLgDark,
    ThreeBarChart,
    ThreeBarChartDark,
    ThreeBarChartLg,
    ThreeBarChartLgDark,
    TwoBarChart,
    TwoBarChartDark,
    TwoBarChartLg,
    TwoBarChartLgDark,
} from "@/images";
import { formatNumbershort } from "@/Utils/format-number";

export const CollectionOfTheMonthWinnersChartWrapper = ({
    children,
    chart,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    chart: JSX.Element;
    className?: string;
}): JSX.Element => (
    <div className="relative flex w-full items-end justify-center overflow-hidden">
        <div className="relative">{chart}</div>
        <div className={cn("absolute inset-0 flex items-end", className)}>{children}</div>
    </div>
);
export const CollectionOfTheMonthWinnersWinnerWrapper = ({
    children,
    className,
}: {
    children: JSX.Element[] | JSX.Element;
    className?: string;
}): JSX.Element => <div className={cn("relative flex flex-col items-center", className)}>{children}</div>;

export const CollectionOfTheMonthWinnersCollectionAvatar = ({
    image,
    large,
}: {
    image: string | null;
    large: boolean;
}): JSX.Element => (
    <Img
        wrapperClassName={cn("aspect-square relative", {
            "h-20 w-20": !large,
            "sm:h-[115px] sm:w-[115px] w-[52px] h-[52px]": large,
        })}
        className="rounded-full"
        src={image}
        isCircle
    />
);

export const CollectionOfTheMonthWinnersChart = ({
    large,
    totalWinners,
}: {
    large: boolean;
    totalWinners: 1 | 2 | 3;
}): JSX.Element => {
    const { isDark } = useDarkModeContext();

    const charts = {
        1: {
            large: {
                dark: <OneBarChartLgDark className="h-auto w-[100px] sm:w-auto" />,
                light: <OneBarChartLg className="h-auto w-[100px] sm:w-auto" />,
            },
            small: {
                dark: <OneBarChartDark />,
                light: <OneBarChart />,
            },
        },
        2: {
            large: {
                dark: <TwoBarChartLgDark className="h-auto w-[160px] sm:w-auto" />,
                light: <TwoBarChartLg className="h-auto w-[160px] sm:w-auto" />,
            },
            small: {
                dark: <TwoBarChartDark />,
                light: <TwoBarChart />,
            },
        },
        3: {
            large: {
                dark: <ThreeBarChartLgDark className="h-auto w-[230px] sm:w-auto" />,
                light: <ThreeBarChartLg className="h-auto w-[230px] sm:w-auto" />,
            },
            small: {
                dark: <ThreeBarChartDark />,
                light: <ThreeBarChart />,
            },
        },
    };

    if (large) {
        return charts[totalWinners].large[isDark ? "dark" : "light"];
    }

    return charts[totalWinners].small[isDark ? "dark" : "light"];
};

export const CollectionOfTheMonthWinnersVotesLabel = ({
    large,
    votes,
    className,
}: {
    large: boolean;
    votes: number;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <span
            className={cn(
                "relative text-center text-white",
                {
                    "text-base font-medium leading-4.5": !large,
                    "text-xs font-bold leading-[14px] sm:text-xl sm:leading-6": large,
                },
                className,
            )}
        >
            {formatNumbershort(votes)}
            <br /> {t("common.votes")}
        </span>
    );
};
