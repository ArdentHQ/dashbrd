import axios from "axios";
import { useState } from "react";

interface LikeOptions {
    count: number;
    hasLiked: boolean;
}

export interface UseLikesReturnType {
    likes: number;
    hasLiked: boolean;
    like: (slug: string) => Promise<void>;
}

export const useLikes = (options: LikeOptions): UseLikesReturnType => {
    const [likes, setLikes] = useState(options.count);
    const [hasLiked, setHasLiked] = useState(options.hasLiked);

    const like = async (slug: string): Promise<void> => {
        const response = await axios.post<App.Data.Gallery.GalleryLikeData>(route("galleries.like", slug));

        setLikes(response.data.likes);
        setHasLiked(response.data.hasLiked);
    };

    return { likes, hasLiked, like };
};
