import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { Platform } from "react-native";

import { apiRequest } from "./api";
import { getSavedToken } from "./auth.service";

type CloudinarySignatureResponse = {
  success: boolean;
  data: {
    timestamp: number;
    signature: string;
    folder: string;
    cloudName: string;
    apiKey: string;
  };
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

type CloudinaryErrorResponse = {
  error?: {
    message?: string;
  };
};

const getCloudinarySignature =
  async (): Promise<CloudinarySignatureResponse> => {
    const token = await getSavedToken();

    if (!token) {
      throw new Error(
        "Authentication required. Please login again."
      );
    }

    return apiRequest<CloudinarySignatureResponse>(
      "/upload/cloudinary-signature",
      {
        method: "GET",
        token,
      }
    );
  };

export const uploadPhotoToCloudinary =
  async (photoUri: string): Promise<string> => {
    const signatureResponse =
      await getCloudinarySignature();

    const {
      timestamp,
      signature,
      folder,
      cloudName,
      apiKey,
    } = signatureResponse.data;

    const formData = new FormData();

    /*
     * WEB
     * ----
     * Browser mein expo-file-system File use nahi karna.
     * Image URI ko Blob mein convert karke Cloudinary ko bhejenge.
     */
    if (Platform.OS === "web") {
      const imageResponse =
        await globalThis.fetch(photoUri);

      if (!imageResponse.ok) {
        throw new Error(
          "Selected photo could not be loaded."
        );
      }

      const blob = await imageResponse.blob();

      formData.append(
        "file",
        blob,
        "profile-photo.jpg"
      );
    }

    /*
     * ANDROID / IOS
     * -------------
     * Native app mein Expo File API use karenge.
     */
    else {
      const file = new File(photoUri);

      if (!file.exists) {
        throw new Error(
          "Selected photo could not be found."
        );
      }

      formData.append("file", file);
    }

    formData.append("api_key", apiKey);
    formData.append(
      "timestamp",
      String(timestamp)
    );
    formData.append("signature", signature);
    formData.append("folder", folder);

    /*
     * Web aur Native dono ke liye upload.
     */
    const response =
      Platform.OS === "web"
        ? await globalThis.fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          )
        : await expoFetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

    const data =
      (await response.json()) as
        | CloudinaryUploadResponse
        | CloudinaryErrorResponse;

    if (!response.ok) {
      throw new Error(
        "error" in data
          ? data.error?.message ||
              "Photo upload failed"
          : "Photo upload failed"
      );
    }

    if (
      !("secure_url" in data) ||
      !data.secure_url
    ) {
      throw new Error(
        "Cloudinary did not return a photo URL."
      );
    }

    return data.secure_url;
  };

export const uploadPhotosToCloudinary =
  async (
    photoUris: string[],
    onProgress?: (
      completed: number,
      total: number
    ) => void
  ): Promise<string[]> => {
    if (photoUris.length === 0) {
      return [];
    }

    const uploadedUrls: string[] = [];

    for (
      let index = 0;
      index < photoUris.length;
      index++
    ) {
      const url =
        await uploadPhotoToCloudinary(
          photoUris[index]
        );

      uploadedUrls.push(url);

      onProgress?.(
        index + 1,
        photoUris.length
      );
    }

    return uploadedUrls;
  };