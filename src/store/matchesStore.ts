import { create } from "zustand";

export type MatchProfile = {
  name: string;
  age: number;
  distance: string;
  bio: string;
  image: string;
};

type MatchesStore = {
 matches: MatchProfile[];
  addMatch: (profile: MatchProfile) => void;
  removeMatch: (name: string) => void;
};

export const useMatchesStore = create<MatchesStore>((set) => ({
  matches: [],

  addMatch: (profile) =>
    set((state) => {
      const alreadyMatched = state.matches.some(
        (item) => item.name === profile.name
      );

      if (alreadyMatched) {
        return state;
      }

      return {
        matches: [...state.matches, profile],
      };
    }),

  removeMatch: (name) =>
    set((state) => ({
      matches: state.matches.filter(
        (item) => item.name !== name
      ),
    })),
}));