import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProperties {
    audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProperties> = ({ audioSrc }) => {
    const audioReference = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    useEffect(() => {
        const audioElement = audioReference.current;
        if (audioElement === null) return;

        audioElement.onloadedmetadata = () => {
            setDuration(audioElement.duration);
        };

        audioElement.ontimeupdate = () => {
            setCurrentTime(audioElement.currentTime);
        };

        audioElement.onended = () => {
            setIsPlaying(false); // Audio finished, set isPlaying to false
        };
    }, []);

    const togglePlayPause = (): void => {
        const audioElement = audioReference.current;

        if (isPlaying) {
            audioElement?.pause();
        } else {
            void audioElement?.play();
        }

        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const handleProgressClick = (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        const audioElement = audioReference.current as HTMLAudioElement;
        const rect = event.currentTarget.getBoundingClientRect();
        const xPos = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX;
        const progress = (xPos - rect.left) / rect.width;
        const newTime = progress * duration;
        audioElement.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <div>
            <audio
                ref={audioReference}
                src={audioSrc}
            />
            <div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 rounded px-4 py-2 font-bold text-theme-secondary-700"
                    onClick={togglePlayPause}
                >
                    {isPlaying ? "Pause" : "Play"}
                </button>
            </div>
            <div>
                <span className="text-gray-700">{formatTime(currentTime)}</span> /{" "}
                <span className="text-gray-700">{formatTime(duration)}</span>
            </div>
            <div>
                <button
                    className="progress-bar-button h-10 w-full bg-theme-hint-50"
                    onClick={handleProgressClick}
                    onTouchStart={handleProgressClick}
                >
                    <span
                        className="progress-bar-fill h-10 bg-theme-danger-400"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></span>
                </button>
            </div>
        </div>
    );
};

export default AudioPlayer;
