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

        if (audioElement) {
            audioElement.addEventListener("timeupdate", () => {
                if (!isSeeking) {
                    setCurrentTime(audioElement.currentTime);
                }
            });

            audioElement.addEventListener("durationchange", () => {
                setDuration(audioElement.duration);
            });

            audioElement.addEventListener("ended", () => {
                setIsPlaying(false);
            });
        }
    }, [isSeeking]);

    const togglePlay = () => {
        const audioElement = audioReference.current;
        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
            } else {
                audioElement.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: MouseEvent | TouchEvent) => {
        const audioElement = audioReference.current;
        if (audioElement) {
            const rect = progressBarReference.current?.getBoundingClientRect();
            if (rect) {
                const x = "touches" in e ? e.touches[0].clientX : e.clientX;
                const percent = ((x - rect.left) / rect.width) * 100;
                const newTime = (percent / 100) * duration;
                audioElement.currentTime = newTime;
                setCurrentTime(newTime);
            }
        }
    };

    // Format duration in MM:SS using padStart
    const formatDuration = (time: number) => {
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
