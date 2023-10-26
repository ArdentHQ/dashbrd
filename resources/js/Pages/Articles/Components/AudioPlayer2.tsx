import React, { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer, { type WaveSurferOptions } from "wavesurfer.js";
import { IconButton } from "@/Components/Buttons";

// WaveSurfer hook
const useWavesurfer = (containerReference: RefObject<HTMLElement | null>, url?: string): WaveSurfer | null => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

    useEffect(() => {
        if (containerReference.current === null) return;

        const ws = WaveSurfer.create({
            url,
            container: containerReference.current,
            barWidth: 2,
            barGap: 2,
            barRadius: 2,
            progressColor: "text-theme-primary-900",
            height: 60,
            cursorWidth: 0,
            waveColor: "#CFD4FF",
            dragToSeek: true,
            hideScrollbar: true,
        });

        setWavesurfer(ws);

        return () => {
            ws.destroy();
        };
    }, [containerReference]);

    return wavesurfer;
};

export const WaveSurferPlayer = (properties: Pick<WaveSurferOptions, "url">): JSX.Element => {
    const containerReference = useRef<HTMLElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const wavesurfer = useWavesurfer(containerReference, properties.url);

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
                setDuration(wavesurfer.getDuration());
            }),
        ];

        return () => {
            for (const unsub of subscriptions) unsub();
        };
    }, [wavesurfer]);

    const formatDuration = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="overflow-hidden rounded-lg bg-theme-secondary-100">
            <div className="rounded-t-lg bg-theme-secondary-200 pb-1.5 pl-4 pt-1">
                <div className="text-xs font-medium leading-4.5 text-theme-secondary-700"> Audio version</div>
            </div>
            <div className="px-4 py-3 pb-0 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex items-end justify-between">
                        <div className="mr-4">
                            <IconButton
                                variant="icon"
                                icon={isPlaying ? "AudioPause" : "AudioPlay"}
                                iconClass="h-5 w-5 text-theme-primary-600 group-hover:text-white transition-all"
                                className="h-8 w-8 bg-theme-primary-200 transition-colors hover:border-theme-primary-700 hover:bg-theme-primary-700"
                                onClick={togglePlay}
                            />
                        </div>

                        <div className="text-xs font-medium leading-4.5 text-theme-secondary-700 sm:hidden">
                            {formatDuration(currentTime)} / {formatDuration(duration)}
                        </div>
                    </div>

                    <div className="mr-2 hidden text-xs font-medium leading-4.5 text-theme-secondary-700 sm:block">
                        {formatDuration(currentTime)}
                    </div>

                    <div
                        ref={containerReference}
                        className="w-full"
                    ></div>

                    <div className="ml-2 hidden text-xs font-medium leading-4.5 text-theme-secondary-700 sm:block">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>
        </div>
    );
};
