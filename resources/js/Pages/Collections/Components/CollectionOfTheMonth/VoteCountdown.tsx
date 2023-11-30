import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
}

const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    const difference = startOfNextMonth.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return {
        days: Math.max(days, 0),
        hours: days > 0 ? Math.max(hours, 0) : 0,
        minutes: Math.max(minutes, 0),
    };
};

const formatTime = (value: number, unit: string): string => `${value}${unit} `;

export const VoteCountdown = (): JSX.Element => {
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

    const countdownDisplay = `${formatTime(timeLeft.days, "d")} : ${formatTime(timeLeft.hours, "h")} : ${formatTime(
        timeLeft.minutes,
        "m",
    )}`;

    return (
        <div className="border-box dark:bg-theme-vote-background flex w-full flex-col overflow-hidden rounded-b-xl rounded-t-2.5xl bg-theme-primary-50 backdrop-blur sm:w-fit sm:flex-row sm:rounded-[1.75rem]">
            <Button
                disabled={true}
                className="flex justify-center py-2 text-base sm:px-5 md:px-12"
            >
                <span className="md:px-0.5">{t("pages.collections.vote.vote")}</span>
            </Button>

            <div className="my-3 flex items-center justify-center text-sm font-semibold leading-4 text-theme-secondary-700 dark:text-theme-dark-300 sm:px-5 md:text-base">
                {t("pages.collections.vote.time_left")}
                {": "}
                {countdownDisplay}
            </div>
        </div>
    );
};
