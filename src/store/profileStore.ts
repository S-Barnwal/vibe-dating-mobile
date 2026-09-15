import { create } from "zustand";

export type UserProfile = {
  name: string;
  age: number;
  distance: string;
  bio: string;
  image: string;
  interests: string[];
  datingIntention: string;
  promptQuestion: string;
  promptAnswer: string;
};

type ProfileStore = {
  profile: UserProfile;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => void;
};

export const useProfileStore = create<ProfileStore>(
  (set) => ({
    profile: {
      name: "Maya",
      age: 23,
      distance: "2 km away",

      bio: "Coffee, sunsets & spontaneous plans ✨",

      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900",

      interests: [
        "Music",
        "Travel",
        "Coffee",
        "Photography",
        "Movies",
        "Food",
      ],

      datingIntention: "Something serious",

      promptQuestion: "My simple pleasure",

      promptAnswer:
        "Finding a cute café and staying there way longer than planned ☕",
    },

    updateProfile: (updates) =>
      set((state) => ({
        profile: {
          ...state.profile,
          ...updates,
        },
      })),
  })
);