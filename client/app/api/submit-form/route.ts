import { NextResponse } from "next/server";
import { uploadImage, uploadAudioDirectly } from "@/lib/cloudinary";
import createClient from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createUser } from "@/lib/action/user.action";

// Azure Vision API setup
const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
const azureKey = process.env.AZURE_VISION_KEY1;
const openAIKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openAIKey,
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!azureEndpoint || !azureKey || !openAIKey) {
      throw new Error("Required API credentials not found");
    }

    const credential = new AzureKeyCredential(azureKey);
    const client = createClient(azureEndpoint, credential);

    console.log("Parsing the data...");
    const formData = await req.formData();
    console.log(
      "FormData entries:",
      Array.from(formData.entries()).map(([key]) => key)
    );

    // Extract user details
    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const contextString = formData.get("context") as string;
    const context = JSON.parse(contextString);

    const imageFiles = formData.getAll("imageFiles") as File[];
    const audioFile = formData.get("audioFile") as File | null;

    let imageAnalysisResult = null;
    let audioTranscriptionResult = null;
    let uploadedImageUrls: string[] = [];
    let uploadedAudioUrl: string | null = null;

    // Process image files
    if (imageFiles && imageFiles.length > 0) {
      console.log("Processing image files...");
      ({ analysis: imageAnalysisResult, urls: uploadedImageUrls } =
        await processImages(imageFiles, client));
    }

    // Process audio file
    if (audioFile) {
      console.log("Processing audio file...");
      audioTranscriptionResult = await processAudio(audioFile);
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      uploadedAudioUrl = await uploadAudioDirectly(audioBuffer); // Upload audio to Cloudinary
    }

    // Combine all data
    const userData = {
      name,
      contact,
      address,
      email,
      context: {
        ...context,
        imageAnalysis: imageAnalysisResult,
        audioTranscription: audioTranscriptionResult,
        imageUrls: uploadedImageUrls,
        audioUrls: uploadedAudioUrl,
      },
    };

    // Save user data to database
    const savedUser = await createUser(userData);
    return NextResponse.json({
      success: true,
      message: "Successfully processed and saved submitted data",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error processing submitted data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process submitted data" },
      { status: 500 }
    );
  }
}

async function processImages(imageFiles: File[], client: any) {
  let imageBuffers: Buffer[] = [];
  for (const imageFile of imageFiles) {
    const buffer = await imageFile.arrayBuffer();
    imageBuffers.push(Buffer.from(buffer));
  }

  // Upload images to Cloudinary
  console.log("Uploading images to Cloudinary...");
  const uploadedImageUrls = await uploadImage({ imageBuffer: imageBuffers });

  // Analyze each uploaded image using Azure Vision API
  const analysisResults = await Promise.all(
    uploadedImageUrls.map(async (imageUrl) => {
      const result = await client.path("/imageanalysis:analyze").post({
        body: { url: imageUrl },
        queryParameters: { features: ["Read"] },
        contentType: "application/json",
      });

      const iaResult = result.body;
      const readResults =
        "readResult" in iaResult && iaResult.readResult
          ? iaResult.readResult.blocks.flatMap((block: any) =>
              block.lines.map((line: any) => line.text)
            )
          : ["No text found"];

      return { readResults };
    })
  );

  const concatenatedText = analysisResults
    .flatMap((result) => result.readResults)
    .join(" ");

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant tasked with creating brief, focused summaries of chat conversations from OCR-extracted text. Your goal is to distill the most important information quickly and clearly.",
      },
      {
        role: "user",
        content: JSON.stringify({ analysisResults, concatenatedText }),
      },
    ],
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return {
    analysis:
      response.choices[0]?.message?.content || "No response text available",
    urls: uploadedImageUrls,
  };
}

async function processAudio(audioFile: File) {
  const fileName = `${uuidv4()}${path.extname(audioFile.name)}`;
  const filePath = path.join("/tmp", fileName);

  const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
  await writeFile(filePath, fileBuffer);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: new File([fileBuffer], audioFile.name, { type: audioFile.type }),
      model: "whisper-1",
    });

    return transcription.text;
  } finally {
    await unlink(filePath);
  }
}
