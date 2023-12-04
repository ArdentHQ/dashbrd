import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    const difference = startOfNextMonth.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
        days: Math.max(days, 0),
        hours: Math.max(hours, 0),
        minutes: Math.max(minutes, 0),
        seconds: Math.max(seconds, 0),
    };
};

const formatTime = (value: number, unit: string): string => {
    /* This will prevent fixed widths and jumping UI */
    const paddedValue = value < 10 ? `0${value}` : `${value}`;
    return `${paddedValue}${unit}`;
};

export const VoteCountdown = ({ hasUserVoted }: { hasUserVoted?: boolean }): JSX.Element => {
    const { t } = useTranslation();

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    let countdownDisplay;

    if (timeLeft.days > 0) {
        countdownDisplay = `${formatTime(timeLeft.days, "d")} : ${formatTime(timeLeft.hours, "h")} : ${formatTime(
            timeLeft.minutes,
            "m",
        )}`;
    } else {
        countdownDisplay = `${formatTime(timeLeft.hours, "h")} : ${formatTime(timeLeft.minutes, "m")} : ${formatTime(
            timeLeft.seconds,
            "s",
        )}`;
    }

    return (
        <div className="border-box flex w-full flex-col overflow-hidden rounded-b-xl rounded-t-2.5xl bg-theme-primary-50 backdrop-blur dark:bg-theme-vote-background sm:w-fit sm:flex-row sm:rounded-[1.75rem]">
            {hasUserVoted === true ? (
                <Tooltip content="You’ve already nominated. Come back next month!">
                    <div className="h-12 w-12 rounded-full bg-theme-hint-100 p-4 dark:bg-[#28374F]">
                        <Icon
                            name="CheckSmall"
                            size="md"
                            className="text-theme-primary-600 dark:text-theme-hint-400"
                        />
                    </div>
                </Tooltip>
            ) : (
                <Button
                    disabled={true}
                    className="flex justify-center py-2 text-base sm:px-5 md:px-12"
                >
                    <span className="md:px-0.5">{t("pages.collections.vote.vote")}</span>
                </Button>
            )}

            <div className="my-3 flex items-center justify-center text-sm font-semibold leading-4 text-theme-secondary-700 dark:text-theme-dark-300 sm:px-5 md:text-base">
                {t("pages.collections.vote.time_left")}
                {": "}
                {countdownDisplay}
            </div>
        </div>
    );
};
