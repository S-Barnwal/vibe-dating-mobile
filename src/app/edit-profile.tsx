import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { useProfileStore } from "../store/profileStore";
import { useTheme } from "../hooks/use-theme";
import { spacing, radius } from "../constants/spacing";
import { typography } from "../constants/typography";

import {
  getMyProfile,
  updateProfile,
  type ProfileData,
  type ProfileUser,
} from "../services/profile.service";

import { uploadPhotoToCloudinary } from "../services/upload.service";

const INTERESTS = [
  "Music",
  "Travel",
  "Coffee",
  "Photography",
  "Movies",
  "Food",
  "Fitness",
  "Art",
  "Gaming",
  "Reading",
  "Cooking",
  "Nature",
];

const DATING_INTENTIONS = [
  "Something serious",
  "Something casual",
  "Long-term relationship",
  "Marriage",
  "New connections",
  "Figuring it out",
];

const PROMPT_QUESTIONS = [
  "My simple pleasure",
  "A perfect weekend looks like",
  "You should message me if",
  "My most random talent",
  "Together we could",
  "The way to my heart is",
];

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();

  const profile = useProfileStore(
    (state) => state.profile
  );

  const updateLocalProfile =
    useProfileStore(
      (state) => state.updateProfile
    );

  const [profileData, setProfileData] =
    useState<ProfileData | null>(null);

  const [userData, setUserData] =
    useState<ProfileUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [name, setName] =
    useState("");

  const [age, setAge] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedInterests, setSelectedInterests] =
    useState<string[]>([]);

  const [datingIntention, setDatingIntention] =
    useState("");

  const [promptQuestion, setPromptQuestion] =
    useState("");

  const [promptAnswer, setPromptAnswer] =
    useState("");

  const [photos, setPhotos] =
    useState<string[]>([]);

  const [isDiscoverable, setIsDiscoverable] =
    useState(true);

  const softPurpleBackground = isDark
    ? "rgba(154, 122, 255, 0.13)"
    : "rgba(109, 61, 245, 0.07)";

  const inputBackground = isDark
    ? theme.surfaceElevated
    : theme.background;

  /*
   * Load the real profile from backend.
   *
   * This is important because Zustand/local state
   * should NOT be the source of truth after app reload.
   */
  const loadProfile = async () => {
    try {
      setLoading(true);

      const response =
        await getMyProfile();

      const backendProfile =
        response.data.profile;

      const backendUser =
        response.data.user;

      setProfileData(backendProfile);
      setUserData(backendUser);

      setName(
        backendUser.name || ""
      );

      setAge(
        String(backendProfile.age || "")
      );

      setBio(
        backendProfile.bio || ""
      );

      setDescription(
        backendProfile.description || ""
      );

      setSelectedInterests(
        backendProfile.interests || []
      );

      setDatingIntention(
        backendProfile.datingIntention || ""
      );

      setPromptQuestion(
        backendProfile.prompts?.[0]
          ?.question || ""
      );

      setPromptAnswer(
        backendProfile.prompts?.[0]
          ?.answer || ""
      );

      setPhotos(
        backendProfile.photos || []
      );

      setIsDiscoverable(
        backendProfile.isDiscoverable
      );

      /*
       * Keep local store synchronized too.
       */
      updateLocalProfile({
        name:
          backendUser.name ||
          profile.name,

        age:
          backendProfile.age ||
          profile.age,

        bio:
          backendProfile.bio ||
          profile.bio,

        image:
          backendProfile.primaryPhoto ||
          backendProfile.photos?.[0] ||
          profile.image,

        interests:
          backendProfile.interests ||
          [],

        datingIntention:
          backendProfile.datingIntention ||
          "",

        promptQuestion:
          backendProfile.prompts?.[0]
            ?.question || "",

        promptAnswer:
          backendProfile.prompts?.[0]
            ?.answer || "",
      });
    } catch (error) {
      console.error(
        "Edit profile load error:",
        error
      );

      Alert.alert(
        "Couldn't load profile",
        "We couldn't load your latest profile details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /*
   * Interest selection.
   */
  const toggleInterest = (
    interest: string
  ) => {
    setSelectedInterests(
      (current) => {
        if (
          current.includes(interest)
        ) {
          return current.filter(
            (item) =>
              item !== interest
          );
        }

        if (current.length >= 8) {
          Alert.alert(
            "Maximum 8 interests",
            "You can select up to 8 interests."
          );

          return current;
        }

        return [
          ...current,
          interest,
        ];
      }
    );
  };

  /*
   * Change main profile photo.
   *
   * Existing photos are preserved.
   * New photo becomes photo #1.
   */
  const handleChangePhoto = async () => {
    if (
      uploadingPhoto ||
      saving
    ) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to choose a profile photo."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          }
        );

      if (result.canceled) {
        return;
      }

      const uri =
        result.assets[0]?.uri;

      if (!uri) {
        return;
      }

      /*
       * Local URI is not permanent.
       * Upload it to Cloudinary first.
       */
      setUploadingPhoto(true);

      const uploadedUrl =
        await uploadPhotoToCloudinary(
          uri
        );

      /*
       * New photo becomes main photo.
       */
      setPhotos(
        (current) => {
          const withoutDuplicate =
            current.filter(
              (photo) =>
                photo !== uploadedUrl
            );

          return [
            uploadedUrl,
            ...withoutDuplicate,
          ].slice(0, 6);
        }
      );

      /*
       * Show immediately.
       */
      updateLocalProfile({
        image: uploadedUrl,
      });
    } catch (error) {
      console.error(
        "Profile photo upload error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to upload the selected photo.";

      Alert.alert(
        "Photo upload failed",
        message
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  /*
   * Remove a photo.
   *
   * Minimum 2 photos because backend
   * profile validation requires 2-6 photos.
   */
  const handleRemovePhoto = (
    index: number
  ) => {
    if (photos.length <= 2) {
      Alert.alert(
        "At least 2 photos required",
        "Your profile must have at least 2 photos."
      );

      return;
    }

    Alert.alert(
      "Remove photo?",
      index === 0
        ? "This is your main profile photo. The next photo will become your main photo."
        : "This photo will be removed from your profile.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPhotos(
              (current) =>
                current.filter(
                  (_, photoIndex) =>
                    photoIndex !== index
                )
            );
          },
        },
      ]
    );
  };

  /*
   * Save everything to backend.
   */
  const handleSave = async () => {
    if (saving) {
      return;
    }

    const trimmedName =
      name.trim();

    const trimmedBio =
      bio.trim();

    const trimmedDescription =
      description.trim();

    const trimmedPromptAnswer =
      promptAnswer.trim();

    const trimmedDatingIntention =
      datingIntention.trim();

    /*
     * Validation
     */
    if (!trimmedName) {
      Alert.alert(
        "Name required",
        "Please enter your name."
      );

      return;
    }

    if (
      trimmedName.length < 2 ||
      trimmedName.length > 50
    ) {
      Alert.alert(
        "Invalid name",
        "Name must be between 2 and 50 characters."
      );

      return;
    }

    if (!trimmedBio) {
      Alert.alert(
        "Bio required",
        "Please add something about yourself."
      );

      return;
    }

    if (trimmedBio.length < 10) {
      Alert.alert(
        "Bio is too short",
        "Your bio should be at least 10 characters."
      );

      return;
    }

    if (
      trimmedBio.length > 180
    ) {
      Alert.alert(
        "Bio is too long",
        "Your bio can be up to 180 characters."
      );

      return;
    }

    if (
      trimmedDescription.length > 500
    ) {
      Alert.alert(
        "Description is too long",
        "Description can be up to 500 characters."
      );

      return;
    }

    if (
      selectedInterests.length < 3
    ) {
      Alert.alert(
        "Choose more interests",
        "Please select at least 3 interests."
      );

      return;
    }

    if (
      selectedInterests.length > 8
    ) {
      Alert.alert(
        "Too many interests",
        "You can select up to 8 interests."
      );

      return;
    }

    if (!trimmedDatingIntention) {
      Alert.alert(
        "Dating intention required",
        "Please select what you're looking for."
      );

      return;
    }

    if (photos.length < 2) {
      Alert.alert(
        "Add more photos",
        "Your profile needs at least 2 photos."
      );

      return;
    }

    if (photos.length > 6) {
      Alert.alert(
        "Too many photos",
        "You can have up to 6 photos."
      );

      return;
    }

    /*
     * Prompt is optional.
     *
     * If answer exists, question must exist.
     */
    let prompts:
      | {
          question: string;
          answer: string;
        }[]
      = [];

    if (
      trimmedPromptAnswer
    ) {
      if (!promptQuestion.trim()) {
        Alert.alert(
          "Choose a prompt",
          "Please select a prompt question for your answer."
        );

        return;
      }

      if (
        trimmedPromptAnswer.length >
        150
      ) {
        Alert.alert(
          "Prompt is too long",
          "Prompt answer can be up to 150 characters."
        );

        return;
      }

      prompts = [
        {
          question:
            promptQuestion.trim(),
          answer:
            trimmedPromptAnswer,
        },
      ];
    }

    try {
      setSaving(true);

      /*
       * PUT request to backend.
       */
      const response =
        await updateProfile({
          name: trimmedName,

          bio: trimmedBio,

          description:
            trimmedDescription,

          interests:
            selectedInterests,

          photos,

          datingIntention:
            trimmedDatingIntention,

          prompts,

          isDiscoverable,
        });

      /*
       * Backend response becomes the new
       * local source immediately.
       */
      const updatedProfile =
        response.data.profile;

      const updatedUser =
        response.data.user;

      setProfileData(
        updatedProfile
      );

      setUserData(
        updatedUser
      );

      setPhotos(
        updatedProfile.photos || []
      );

      updateLocalProfile({
        name:
          updatedUser.name,

        age:
          updatedProfile.age,

        bio:
          updatedProfile.bio,

        image:
          updatedProfile.primaryPhoto ||
          updatedProfile.photos?.[0] ||
          profile.image,

        interests:
          updatedProfile.interests,

        datingIntention:
          updatedProfile.datingIntention,

        promptQuestion:
          updatedProfile.prompts?.[0]
            ?.question || "",

        promptAnswer:
          updatedProfile.prompts?.[0]
            ?.answer || "",
      });

      Alert.alert(
        "Profile updated ✨",
        "Your changes have been saved successfully.",
        [
          {
            text: "Done",
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your profile.";

      Alert.alert(
        "Couldn't save changes",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Loading your profile...
        </Text>

        <Text
          style={[
            styles.loadingSubtitle,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          Getting your latest details
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          {
            backgroundColor:
              theme.background,

            borderBottomColor:
              theme.border,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,

              opacity: pressed
                ? 0.7
                : 1,
            },
          ]}
          onPress={() =>
            router.back()
          }
          disabled={saving}
        >
          <Text
            style={[
              styles.backIcon,
              {
                color:
                  theme.text,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Edit Profile
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.saveTopButton,
            {
              backgroundColor:
                softPurpleBackground,

              opacity:
                pressed || saving
                  ? 0.7
                  : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
            />
          ) : (
            <Text
              style={[
                styles.saveTopText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= PHOTOS ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Your photos
        </Text>

        <Text
          style={[
            styles.sectionSubtitle,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          Your first photo is your main
          profile photo.
        </Text>

        <View
          style={styles.photoGrid}
        >
          {photos.map(
            (photo, index) => (
              <View
                key={`${photo}-${index}`}
                style={[
                  styles.photoBox,
                  {
                    backgroundColor:
                      theme.surface,

                    borderColor:
                      theme.border,
                  },
                ]}
              >
                <Image
                  source={{
                    uri: photo,
                  }}
                  style={
                    styles.photoImage
                  }
                />

                {index === 0 && (
                  <View
                    style={[
                      styles.mainBadge,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.mainBadgeText
                      }
                    >
                      Main
                    </Text>
                  </View>
                )}

                <Pressable
                  style={[
                    styles.removePhotoButton,
                    {
                      backgroundColor:
                        isDark
                          ? "#FFFFFF"
                          : "#17151C",
                    },
                  ]}
                  onPress={() =>
                    handleRemovePhoto(
                      index
                    )
                  }
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.removePhotoText,
                      {
                        color:
                          isDark
                            ? "#17151C"
                            : "#FFFFFF",
                      },
                    ]}
                  >
                    ×
                  </Text>
                </Pressable>
              </View>
            )
          )}

          {photos.length < 6 && (
            <Pressable
              style={[
                styles.addPhotoBox,
                {
                  backgroundColor:
                    theme.surface,

                  borderColor:
                    theme.border,
                },
              ]}
              onPress={
                handleChangePhoto
              }
              disabled={
                uploadingPhoto ||
                saving
              }
            >
              {uploadingPhoto ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.primary
                  }
                />
              ) : (
                <>
                  <View
                    style={[
                      styles.addPhotoCircle,
                      {
                        backgroundColor:
                          isDark
                            ? "#211D29"
                            : "#F3EEFF",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.addPhotoPlus,
                        {
                          color:
                            theme.primary,
                        },
                      ]}
                    >
                      +
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.addPhotoText,
                      {
                        color:
                          theme.textMuted,
                      },
                    ]}
                  >
                    Add photo
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <Text
          style={[
            styles.photoCount,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          {photos.length}/6 photos
        </Text>

        {/* ================= BASIC INFORMATION ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Basic information
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
        >
          {/* Name */}

          <Text
            style={[
              styles.inputLabel,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={
              theme.textMuted
            }
            style={[
              styles.input,
              {
                backgroundColor:
                  inputBackground,

                borderColor:
                  theme.border,

                color:
                  theme.text,
              },
            ]}
            maxLength={50}
          />

          {/* Age */}

          <Text
            style={[
              styles.inputLabel,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Age
          </Text>

          <View
            style={[
              styles.readOnlyInput,
              {
                backgroundColor:
                  isDark
                    ? "#211D29"
                    : "#F3F0F5",

                borderColor:
                  theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.readOnlyText,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              {age}
            </Text>

            <Text
              style={[
                styles.readOnlyHint,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              Age is based on your
              date of birth
            </Text>
          </View>

          {/* Bio */}

          <Text
            style={[
              styles.inputLabel,
              {
                color:
                  theme.text,
              },
            ]}
          >
            About me
          </Text>

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people a little about yourself..."
            placeholderTextColor={
              theme.textMuted
            }
            style={[
              styles.input,
              styles.bioInput,
              {
                backgroundColor:
                  inputBackground,

                borderColor:
                  theme.border,

                color:
                  theme.text,
              },
            ]}
            multiline
            textAlignVertical="top"
            maxLength={180}
          />

          <Text
            style={[
              styles.characterCount,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            {bio.length}/180
          </Text>

          {/* Description */}

          <Text
            style={[
              styles.inputLabel,
              {
                color:
                  theme.text,
              },
            ]}
          >
            More about you
          </Text>

          <TextInput
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Tell people a little more about yourself..."
            placeholderTextColor={
              theme.textMuted
            }
            style={[
              styles.input,
              styles.descriptionInput,
              {
                backgroundColor:
                  inputBackground,

                borderColor:
                  theme.border,

                color:
                  theme.text,
              },
            ]}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <Text
            style={[
              styles.characterCount,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            {description.length}/500
          </Text>
        </View>

        {/* ================= INTERESTS ================= */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={[
              styles.sectionHeaderTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            My interests
          </Text>

          <Text
            style={[
              styles.selectedCount,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            {selectedInterests.length}/8
          </Text>
        </View>

        <View
          style={[
            styles.interestsCard,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.helperText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Pick 3–8 things that feel like
            you.
          </Text>

          <View
            style={styles.interests}
          >
            {INTERESTS.map(
              (interest) => {
                const selected =
                  selectedInterests.includes(
                    interest
                  );

                return (
                  <Pressable
                    key={interest}
                    style={[
                      styles.interest,
                      {
                        backgroundColor:
                          selected
                            ? softPurpleBackground
                            : inputBackground,

                        borderColor:
                          selected
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                    onPress={() =>
                      toggleInterest(
                        interest
                      )
                    }
                    disabled={saving}
                  >
                    {selected && (
                      <Text
                        style={[
                          styles.check,
                          {
                            color:
                              theme.primary,
                          },
                        ]}
                      >
                        ✓
                      </Text>
                    )}

                    <Text
                      style={[
                        styles.interestText,
                        {
                          color:
                            selected
                              ? theme.primary
                              : theme.textMuted,

                          fontWeight:
                            selected
                              ? "700"
                              : "600",
                        },
                      ]}
                    >
                      {interest}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        {/* ================= DATING INTENTION ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          What are you looking for?
        </Text>

        <View
          style={[
            styles.optionsCard,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
        >
          {DATING_INTENTIONS.map(
            (option) => {
              const selected =
                datingIntention ===
                option;

              return (
                <Pressable
                  key={option}
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        selected
                          ? softPurpleBackground
                          : "transparent",
                    },
                  ]}
                  onPress={() =>
                    setDatingIntention(
                      option
                    )
                  }
                  disabled={saving}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor:
                          selected
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioDot,
                          {
                            backgroundColor:
                              theme.primary,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selected
                            ? theme.text
                            : theme.textMuted,

                        fontWeight:
                          selected
                            ? "700"
                            : "600",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {/* ================= PROMPT ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Profile prompt
        </Text>

        <View
          style={[
            styles.promptCard,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.promptLabel,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Choose a prompt
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.promptChoices
            }
          >
            {PROMPT_QUESTIONS.map(
              (question) => {
                const selected =
                  promptQuestion ===
                  question;

                return (
                  <Pressable
                    key={question}
                    onPress={() =>
                      setPromptQuestion(
                        question
                      )
                    }
                    style={[
                      styles.promptChoice,
                      {
                        backgroundColor:
                          selected
                            ? softPurpleBackground
                            : inputBackground,

                        borderColor:
                          selected
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.promptChoiceText,
                        {
                          color:
                            selected
                              ? theme.primary
                              : theme.textMuted,
                        },
                      ]}
                    >
                      {question}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          <TextInput
            value={promptAnswer}
            onChangeText={
              setPromptAnswer
            }
            placeholder={
              promptQuestion
                ? "Write your answer..."
                : "Choose a prompt first..."
            }
            placeholderTextColor={
              theme.textMuted
            }
            style={[
              styles.promptInput,
              {
                backgroundColor:
                  inputBackground,

                borderColor:
                  theme.border,

                color:
                  theme.text,
              },
            ]}
            multiline
            textAlignVertical="top"
            maxLength={150}
            editable={
              Boolean(promptQuestion)
            }
          />

          <Text
            style={[
              styles.promptCount,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            {promptAnswer.length}/150
          </Text>

          {promptQuestion &&
            promptAnswer && (
              <Pressable
                onPress={() => {
                  setPromptQuestion(
                    ""
                  );
                  setPromptAnswer(
                    ""
                  );
                }}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.clearPrompt,
                    {
                      color:
                        theme.danger,
                    },
                  ]}
                >
                  Remove prompt
                </Text>
              </Pressable>
            )}
        </View>

        {/* ================= DISCOVERABILITY ================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          Profile visibility
        </Text>

        <Pressable
          style={[
            styles.visibilityCard,
            {
              backgroundColor:
                theme.surface,

              borderColor:
                theme.border,
            },
          ]}
          onPress={() =>
            setIsDiscoverable(
              (current) =>
                !current
            )
          }
          disabled={saving}
        >
          <View
            style={
              styles.visibilityContent
            }
          >
            <Text
              style={[
                styles.visibilityTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Show me on Vibe
            </Text>

            <Text
              style={[
                styles.visibilitySubtitle,
                {
                  color:
                    theme.textMuted,
                },
              ]}
            >
              {isDiscoverable
                ? "People can discover your profile."
                : "Your profile is hidden from discovery."}
            </Text>
          </View>

          <View
            style={[
              styles.switchOuter,
              {
                backgroundColor:
                  isDiscoverable
                    ? theme.primary
                    : theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                {
                  transform: [
                    {
                      translateX:
                        isDiscoverable
                          ? 11
                          : -11,
                    },
                  ],
                },
              ]}
            />
          </View>
        </Pressable>

        {/* ================= SAVE ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor:
                theme.primary,

              opacity:
                pressed || saving
                  ? 0.85
                  : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.saveButtonText
              }
            >
              Save Changes
            </Text>
          )}
        </Pressable>

        {/* ================= CANCEL ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            {
              opacity: pressed
                ? 0.6
                : 1,
            },
          ]}
          onPress={() =>
            router.back()
          }
          disabled={saving}
        >
          <Text
            style={[
              styles.cancelButtonText,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            Cancel
          </Text>
        </Pressable>

        <Text
          style={[
            styles.footerText,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          Your changes are saved to your
          Vibe profile and will remain after
          you reload the app.
        </Text>

        <View
          style={{ height: 30 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "800",
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 13,
  },

  /* ================= HEADER ================= */

  header: {
    height: 66,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 32,
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  saveTopButton: {
    minWidth: 58,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  saveTopText: {
    fontSize: 14,
    fontWeight: "800",
  },

  /* ================= CONTENT ================= */

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 13,
  },

  /* ================= PHOTOS ================= */

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  photoBox: {
    width: "31.8%",
    aspectRatio: 0.78,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },

  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  mainBadge: {
    position: "absolute",
    left: 7,
    top: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  mainBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  removePhotoButton: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  removePhotoText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "500",
  },

  addPhotoBox: {
    width: "31.8%",
    aspectRatio: 0.78,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },

  addPhotoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  addPhotoPlus: {
    fontSize: 27,
    fontWeight: "300",
  },

  addPhotoText: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "600",
  },

  photoCount: {
    marginTop: 8,
    fontSize: 11,
    textAlign: "right",
  },

  /* ================= CARD ================= */

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 5,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },

  bioInput: {
    minHeight: 105,
  },

  descriptionInput: {
    minHeight: 120,
  },

  characterCount: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
    marginBottom: 8,
  },

  readOnlyInput: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  readOnlyText: {
    fontSize: 14,
    fontWeight: "700",
  },

  readOnlyHint: {
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
    fontSize: 10,
  },

  /* ================= INTERESTS ================= */

  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  selectedCount: {
    fontSize: 12,
    fontWeight: "800",
  },

  interestsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  helperText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },

  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  interest: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    fontSize: 13,
    fontWeight: "800",
    marginRight: 5,
  },

  interestText: {
    fontSize: 12,
  },

  /* ================= OPTIONS ================= */

  optionsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 8,
  },

  option: {
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  optionText: {
    fontSize: 13,
  },

  /* ================= PROMPT ================= */

  promptCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  promptLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },

  promptChoices: {
    gap: 8,
    paddingBottom: 12,
  },

  promptChoice: {
    maxWidth: 190,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
  },

  promptChoiceText: {
    fontSize: 11,
    fontWeight: "600",
  },

  promptInput: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },

  promptCount: {
    marginTop: 5,
    fontSize: 10,
    textAlign: "right",
  },

  clearPrompt: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
  },

  /* ================= VISIBILITY ================= */

  visibilityCard: {
    minHeight: 76,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  visibilityContent: {
    flex: 1,
  },

  visibilityTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  visibilitySubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
  },

  switchOuter: {
    width: 42,
    height: 25,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  switchThumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  /* ================= SAVE ================= */

  saveButton: {
    height: 54,
    marginTop: 28,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    ...typography.button,
  },

  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
});