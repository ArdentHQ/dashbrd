import React, { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import WaveSurfer, { type WaveSurferOptions } from "wavesurfer.js";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { useDarkModeContext } from "@/Contexts/DarkModeContex";

const useWavesurfer = (containerReference: RefObject<HTMLElement | null>, url?: string): WaveSurfer | null => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const { isDark } = useDarkModeContext();

    useEffect(() => {
        if (containerReference.current === null) return;

        const ws = WaveSurfer.create({
            url,
            container: containerReference.current,
            barWidth: 2,
            barGap: 2,
            barRadius: 10,
            progressColor: isDark ? "#8692FF" : "#212B83",
            height: 24,
            cursorWidth: 0,
            waveColor: isDark ? "#5D6F7D" : "#CFD4FF",
            dragToSeek: true,
            hideScrollbar: true,
            normalize: true,
        });

        setWavesurfer(ws);

        return () => {
            ws.destroy();
        };
    }, [containerReference]);

    return wavesurfer;
};

const formatDuration = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const WaveSurferPlayer = (properties: Pick<WaveSurferOptions, "url">): JSX.Element => {
    const containerReference = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isReady, setReady] = useState(false);
    const wavesurfer = useWavesurfer(containerReference, properties.url);

    const { t } = useTranslation();

    const togglePlay = useCallback(() => {
        wavesurfer?.isPlaying() === true ? wavesurfer.pause() : wavesurfer?.play();
    }, [wavesurfer]);

    useEffect(() => {
        if (wavesurfer === null) return;

        setCurrentTime(0);

        setIsPlaying(false);
        const subscriptions = [
            wavesurfer.on("play", () => {
                setIsPlaying(true);
            }),
            wavesurfer.on("pause", () => {
                setIsPlaying(false);
            }),
            wavesurfer.on("timeupdate", (currentTime) => {
                setCurrentTime(currentTime);
            }),

            wavesurfer.on("ready", () => {
                setReady(true);
                setDuration(wavesurfer.getDuration());
            }),
        ];

        return () => {
            for (const unsub of subscriptions) unsub();
        };
    }, [wavesurfer]);

    return (
        <div className="overflow-hidden rounded-lg bg-theme-secondary-100 dark:bg-theme-dark-800">
            <div className="flex flex-row items-center justify-between rounded-t-lg bg-theme-secondary-200 pb-1.5 pl-4 pt-1 text-xs font-medium leading-4.5 text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200">
                <div>{t("pages.articles.audio_version")}</div>

                <div className="pr-4 sm:hidden">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
            </div>
            <div className="px-4 py-3">
                <div className="flex flex-row items-center">
                    <div className="flex items-end justify-between">
                        <div className="mr-4">
                            <Button
                                processing={!isReady}
                                variant="icon"
                                icon={isPlaying ? "AudioPause" : "AudioPlay"}
                                iconClass="h-5 w-5 text-theme-primary-600 group-hover:text-white transition-all dark:text-theme-primary-400 dark:group-hover:text-theme-primary-500"
                                className="dark:transition-default h-8 w-8 bg-theme-primary-200 transition-colors hover:border-theme-primary-700 hover:bg-theme-primary-700 dark:bg-theme-dark-700 dark:hover:border-transparent dark:hover:bg-theme-dark-600"
                                onClick={togglePlay}
                            />
                        </div>
                    </div>

                    <div className="mr-2 hidden text-xs font-medium leading-4.5 text-theme-secondary-700 dark:text-theme-dark-200 sm:block">
                        {formatDuration(currentTime)}
                    </div>

                    <div
                        ref={containerReference}
                        className="h-6 w-full transition-all"
                    >
                        {!isReady && (
                            <div className="flex h-6 items-center justify-center transition-all">
                                <Icon
                                    name="Spinner"
                                    className="animate-spin text-theme-primary-600 dark:text-theme-primary-400"
                                    size="lg"
                                />
                            </div>
                        )}
                    </div>

                    <div className="ml-2 hidden text-xs font-medium leading-4.5 text-theme-secondary-700 dark:text-theme-dark-200 sm:block">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>
        </div>
    );
};
