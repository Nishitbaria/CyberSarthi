import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import createClient from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";
import OpenAI from "openai";

//azure Vision API setup
const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
const azureKey = process.env.AZURE_VISION_KEY1;
const openAIKey = process.env.OPENAI_API_KEY;
export async function POST(req: Request): Promise<
  NextResponse<{
    success: boolean;
    message: string;
    data?: string;
  }>
> {
  try {
    if (!azureEndpoint || !azureKey || !openAIKey) {
      throw new Error("Azure Vision API credentials not found");
    }
    const credential = new AzureKeyCredential(azureKey);
    const client = createClient(azureEndpoint, credential);
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("Parsing the data...");

    // Extract image from the form data
    const formData = await req.formData();
    console.log("FormData entries:");

    const imageFiles = formData.getAll("imageFiles") as File[];
    console.log("Retrieved image files:", imageFiles);

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: "No image file found" },
        { status: 400 }
      );
    }

    // Convert image(s) to buffer(s)
    let imageBuffers: Buffer[] = [];
    for (const imageFile of imageFiles) {
      const buffer = await imageFile.arrayBuffer();
      imageBuffers.push(Buffer.from(buffer));
    }

    // Upload images to Cloudinary and maintain order
    console.log("Uploading images to Cloudinary...");
    const uploadedImageUrls = await uploadImage({ imageBuffer: imageBuffers });

    // Analyze each uploaded image using Azure Vision API
    const analysisResults = await Promise.all(
      uploadedImageUrls.map(async (imageUrl, index) => {
        const result = await client.path("/imageanalysis:analyze").post({
          body: { url: imageUrl },
          queryParameters: { features: ["Read"] }, // Only request OCR
          contentType: "application/json",
        });

        const iaResult = result.body;
        const readResults =
          "readResult" in iaResult && iaResult.readResult
            ? iaResult.readResult.blocks.flatMap((block) =>
                block.lines.map((line) => line.text)
              )
            : ["No text found"];

        return {
          readResults,
        };
      })
    );

    // Ensure results are in the same order as the uploaded images
    const orderedResults = imageFiles.map((_, index) => analysisResults[index]);

    // Concatenate all text from readResults into a single paragraph
    const concatenatedText = orderedResults
      .flatMap((result) => result.readResults)
      .join(" ");
    console.log(JSON.stringify({ analysisResults, concatenatedText }, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an AI assistant tasked with creating brief, focused summaries of chat conversations from OCR-extracted text. Your goal is to distill the most important information quickly and clearly. Follow these guidelines:\n\n1. Length: Keep the summary very concise, ideally 3-5 bullet points or 2-3 short sentences.\n\n2. Key Information:\n   - Identify the main topic or purpose of the conversation\n   - Highlight critical decisions, action items, or deadlines\n   - Note any crucial questions asked or important answers given\n\n3. Participants: Mention only if directly relevant to understanding the key points.\n\n4. Context: Briefly note if the conversation appears professional, personal, or urgent, but only if it's essential to the main points.\n\n5. OCR Considerations:\n   - Focus on clear, confident information\n   - Avoid speculating on unclear parts of the text\n   - If critical information seems missing due to OCR issues, briefly mention this\n\n6. Format:\n   - Use bullet points for easy scanning\n   - Start with the most important information\n   - Use clear, direct language\n\nRemember, your primary goal is to provide a quick, accurate snapshot of the most crucial information from the conversation. Omit details that aren't central to the main points or immediate actions required.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify({ analysisResults, concatenatedText }),
            },
          ],
        },
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully processed images",
      data:
        response.choices?.[0]?.message?.content || "No response text available",
    });
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process images" },
      { status: 500 }
    );
  }
}
