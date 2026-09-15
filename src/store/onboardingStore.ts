import { create } from "zustand";

type OnboardingStore = {
  birthday: string;
  gender: string;
  interestedIn: string;
  interests: string[];
  photos: string[];

  // Profile details
  bio: string;
  description: string;
  datingIntention: string;
  promptQuestion: string;
  promptAnswer: string;

  // Location
  latitude: number | null;
  longitude: number | null;

  // Actions
  setBirthday: (birthday: string) => void;
  setGender: (gender: string) => void;
  setInterestedIn: (interestedIn: string) => void;
  setInterests: (interests: string[]) => void;
  setPhotos: (photos: string[]) => void;

  setBio: (bio: string) => void;
  setDescription: (description: string) => void;
  setDatingIntention: (datingIntention: string) => void;
  setPromptQuestion: (promptQuestion: string) => void;
  setPromptAnswer: (promptAnswer: string) => void;

  setLocation: (
    latitude: number,
    longitude: number
  ) => void;

  clearLocation: () => void;

  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingStore>(
  (set) => ({
    // ========================================================
    // INITIAL STATE
    // ========================================================

    birthday: "",
    gender: "",
    interestedIn: "",
    interests: [],
    photos: [],

    bio: "",
    description: "",
    datingIntention: "",
    promptQuestion: "",
    promptAnswer: "",

    latitude: null,
    longitude: null,

    // ========================================================
    // BASIC ONBOARDING
    // ========================================================

    setBirthday: (birthday) =>
      set({ birthday }),

    setGender: (gender) =>
      set({ gender }),

    setInterestedIn: (interestedIn) =>
      set({ interestedIn }),

    setInterests: (interests) =>
      set({ interests }),

    setPhotos: (photos) =>
      set({ photos }),

    // ========================================================
    // PROFILE DETAILS
    // ========================================================

    setBio: (bio) =>
      set({ bio }),

    setDescription: (description) =>
      set({ description }),

    setDatingIntention: (datingIntention) =>
      set({ datingIntention }),

    setPromptQuestion: (promptQuestion) =>
      set({ promptQuestion }),

    setPromptAnswer: (promptAnswer) =>
      set({ promptAnswer }),

    // ========================================================
    // LOCATION
    // ========================================================

    setLocation: (latitude, longitude) =>
      set({
        latitude,
        longitude,
      }),

    clearLocation: () =>
      set({
        latitude: null,
        longitude: null,
      }),

    // ========================================================
    // RESET
    // ========================================================

    resetOnboarding: () =>
      set({
        birthday: "",
        gender: "",
        interestedIn: "",
        interests: [],
        photos: [],

        bio: "",
        description: "",
        datingIntention: "",
        promptQuestion: "",
        promptAnswer: "",

        latitude: null,
        longitude: null,
      }),
  })
);