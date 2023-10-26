import React, { type MouseEvent, type TouchEvent, useEffect, useRef, useState } from "react";

export const AudioPlayer: React.FC<{ audioSrc: string }> = ({ audioSrc }) => {
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
        const percent = ((x - rect.left) / rect.width) * 100;
        const newTime = (percent / 100) * duration;
        audioElement.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Format duration in MM:SS using padStart
    const formatDuration = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-gray-200 mx-auto w-full max-w-lg rounded-md p-4">
            <audio
                ref={audioReference}
                src={audioSrc}
            ></audio>
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={togglePlay}
                        className="p-2 text-xl"
                    >
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                </div>
                <div className="text-gray-600">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
            </div>
            <div
                className="relative mt-4 h-4 bg-theme-hint-50"
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
                    className="absolute top-0 h-4 bg-theme-primary-100"
                    style={{
                        width: (currentTime / duration) * 100 + "%",
                    }}
                ></div>
            </div>
        </div>
    );
};
