import { create } from "zustand";

export type LikedProfile = {
  userId: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  image: string;
};

type LikesStore = {
  likedProfiles: LikedProfile[];

  addLike: (profile: LikedProfile) => void;

  removeLike: (userId: string) => void;

  hasLiked: (userId: string) => boolean;

  clearLikes: () => void;
};

export const useLikesStore = create<LikesStore>((set, get) => ({
  likedProfiles: [],

  addLike: (profile) =>
    set((state) => {
      const alreadyLiked = state.likedProfiles.some(
        (item) => item.userId === profile.userId
      );

      if (alreadyLiked) {
        return state;
      }

      return {
        likedProfiles: [
          ...state.likedProfiles,
          profile,
        ],
      };
    }),

  removeLike: (userId) =>
    set((state) => ({
      likedProfiles: state.likedProfiles.filter(
        (item) => item.userId !== userId
      ),
    })),

  hasLiked: (userId) =>
    get().likedProfiles.some(
      (item) => item.userId === userId
    ),

  clearLikes: () => {
    set({
      likedProfiles: [],
    });
  },
})); 