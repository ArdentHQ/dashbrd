import axios from "axios";
import { useState } from "react";
interface LikeOptions {
    count: number;
    hasLiked: boolean;
}

export interface UseLikesReturnType {
    likes: number;
    hasLiked: boolean;
    like: (slug: string, like?: boolean) => Promise<void>;
}

export const useLikes = (options: LikeOptions): UseLikesReturnType => {
    const [likes, setLikes] = useState<number>();
    const [hasLiked, setHasLiked] = useState<boolean>();

    const like = async (slug: string, like?: boolean): Promise<void> => {
        const query: {
            like?: boolean;
        } = {};

        if (like !== undefined) {
            query.like = like;
        }

        const response = await axios.post<App.Data.Gallery.GalleryLikeData>(
            route("galleries.like", {
                gallery: slug,
                _query: query,
            }),
        );

        setLikes(response.data.likes);

        setHasLiked(response.data.hasLiked);
    };

    return { likes: likes ?? options.count, hasLiked: hasLiked ?? options.hasLiked, like };
};
