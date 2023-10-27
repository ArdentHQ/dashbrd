import React, { type MouseEvent, type TouchEvent, useEffect, useRef, useState } from "react";
import { IconButton } from "@/Components/Buttons";

const formatDuration = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const AudioPlayer = ({ audioSrc }: { audioSrc: string }): JSX.Element => {
    const audioReference = useRef<HTMLAudioElement>(null);
    const progressBarReference = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

    useEffect(() => {
        const audioElement = audioReference.current;
        if (audioElement === null) return;
        const handleTimeUpdate = (): void => {
            if (!isSeeking) {
                setCurrentTime(audioElement.currentTime);
            }
        };

        const handleDurationChange = (): void => {
            setDuration(audioElement.duration);
        };
        const handleEnded = (): void => {
            setIsPlaying(false);
        };

        audioElement.addEventListener("timeupdate", handleTimeUpdate);
        audioElement.addEventListener("durationchange", handleDurationChange);
        audioElement.addEventListener("ended", handleEnded);

        return () => {
            audioElement.removeEventListener("timeupdate", handleTimeUpdate);
            audioElement.removeEventListener("durationchange", handleDurationChange);
            audioElement.removeEventListener("ended", handleEnded);
        };
    }, [isSeeking]);

    const togglePlay = (): void => {
        const audioElement = audioReference.current;
        if (audioElement === null) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            void audioElement.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (event: MouseEvent | TouchEvent): void => {
        const audioElement = audioReference.current;
        if (audioElement === null || progressBarReference.current === null) return;

        const rect = progressBarReference.current.getBoundingClientRect();
        const x = "touches" in event ? event.touches[0].clientX : event.clientX;
        let percent = ((x - rect.left) / rect.width) * 100;

        percent = percent > 100 ? 100 : percent;
        percent = percent < 0 ? 0 : percent;

        const newTime = (percent / 100) * duration;
        audioElement.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div className="overflow-hidden rounded-lg bg-theme-secondary-100">
            <audio
                ref={audioReference}
                src={audioSrc}
            ></audio>
            <div className="rounded-t-lg bg-theme-secondary-200 pb-1.5 pl-4 pt-1">
                <div className="text-xs font-medium leading-4.5 text-theme-secondary-700"> Audio version</div>
            </div>
            <div className="px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="mb-3 flex items-end justify-between sm:mb-0">
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
                        className="relative h-2 w-full cursor-pointer rounded-lg bg-theme-primary-100"
                        ref={progressBarReference}
                        onClick={handleSeek}
                        onMouseDown={() => {
                            setIsSeeking(true);
                        }}
                        onTouchStart={() => {
                            setIsSeeking(true);
                        }}
                        onMouseUp={() => {
                            setIsSeeking(false);
                        }}
                        onTouchEnd={() => {
                            setIsSeeking(false);
                        }}
                        onMouseMove={isSeeking ? handleSeek : undefined}
                        onTouchMove={isSeeking ? handleSeek : undefined}
                    >
                        <div
                            className="absolute top-0 h-2 rounded-lg bg-theme-hint-500"
                            style={{
                                width: (currentTime / duration) * 100 + "%",
                            }}
                        ></div>
                    </div>
                    <div className="ml-2 hidden text-xs font-medium leading-4.5 text-theme-secondary-700 sm:block">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>
        </div>
    );
};
