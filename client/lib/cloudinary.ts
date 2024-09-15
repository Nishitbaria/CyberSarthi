"use server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadImageProps {
  imageUrl?: string | string[]; // Image URL(s)
  imageBuffer?: Buffer | Buffer[]; // Image buffer(s)
}

// Function to upload images to Cloudinary under the /AntiScam folder
export async function uploadImage({
  imageUrl,
  imageBuffer,
}: UploadImageProps): Promise<string[]> {
  try {
    if (!imageUrl && !imageBuffer) {
      throw new Error("Either imageUrl or imageBuffer must be provided");
    }

    // Set upload options with folder `/AntiScam`
    const uploadOptions = {
      folder: "AntiScam",
      resource_type: "image" as "image",
    };

    let uploadResponses: string[] = [];

    // Handle image URL upload
    if (imageUrl) {
      if (Array.isArray(imageUrl)) {
        const uploadPromises = imageUrl.map(async (url) => {
          const response = await cloudinary.uploader.upload(url, uploadOptions);
          return response.secure_url;
        });
        uploadResponses = await Promise.all(uploadPromises);
      } else {
        const response = await cloudinary.uploader.upload(
          imageUrl,
          uploadOptions
        );
        uploadResponses.push(response.secure_url);
      }
    }

    // Handle image buffer upload
    if (imageBuffer) {
      const uploadBuffer = async (buffer: Buffer) => {
        const base64Image = buffer.toString("base64");
        const response = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Image}`,
          uploadOptions
        );
        return response.secure_url;
      };

      if (Array.isArray(imageBuffer)) {
        const uploadPromises = imageBuffer.map(uploadBuffer);
        const bufferResponses = await Promise.all(uploadPromises);
        uploadResponses = [...uploadResponses, ...bufferResponses]; // Merge with URL uploads
      } else {
        const response = await uploadBuffer(imageBuffer);
        uploadResponses.push(response);
      }
    }

    return uploadResponses; // Return always as an array of strings
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}

// Function to upload audio files to Cloudinary under the /AntiScam folder
export async function uploadAudioDirectly(
  audioBuffer: Buffer
): Promise<string> {
  try {
    if (!audioBuffer) {
      throw new Error("Audio buffer must be provided");
    }

    // Set upload options with folder `/AntiScam` for audio files
    const uploadOptions = {
      folder: "AntiScam",
      resource_type: "video" as "video", // Use 'video' for audio uploads in Cloudinary
    };

    // Convert the audio buffer to base64 and upload to Cloudinary
    const base64Audio = audioBuffer.toString("base64");
    const response = await cloudinary.uploader.upload(
      `data:audio/mpeg;base64,${base64Audio}`,
      uploadOptions
    );

    return response.secure_url; // Return the secure URL of the uploaded audio
  } catch (error) {
    console.error("Error uploading audio to Cloudinary:", error);
    throw error;
  }
}

// Function to upload PDF files to Cloudinary under the /AntiScam folder
export async function uploadPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    if (!pdfBuffer) {
      throw new Error("PDF buffer must be provided");
    }

    // Set upload options with folder `/AntiScam` for PDF files
    const uploadOptions = {
      folder: "AntiScam",
      resource_type: "raw" as "raw", // Use 'raw' for PDF uploads in Cloudinary
    };

    // Convert the PDF buffer to base64 and upload to Cloudinary
    const base64PDF = pdfBuffer.toString("base64");
    const response = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${base64PDF}`,
      uploadOptions
    );

    return response.secure_url; // Return the secure URL of the uploaded PDF
  } catch (error) {
    console.error("Error uploading PDF to Cloudinary:", error);
    throw error;
  }
}
