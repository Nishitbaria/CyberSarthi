import { NextResponse } from "next/server";
import createClient from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";

// Azure Vision API setup
const azureEndpoint = process.env.AZURE_VISION_ENDPOINT;
const azureKey = process.env.AZURE_VISION_KEY1;

export async function POST(req: Request): Promise<
  NextResponse<{
    success: boolean;
    message: string;
    data?: {
      concatenatedText: string;
      analysisResults: any;
    };
  }>
> {
  try {
    if (!azureEndpoint || !azureKey) {
      throw new Error("Azure Vision API credentials not found");
    }

    const credential = new AzureKeyCredential(azureKey);
    const client = createClient(azureEndpoint, credential);

    // Parse the JSON body to get the imageUrl
    const body = await req.json();
    const imageUrl = body.imageUrl;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "No image URL provided" },
        { status: 400 }
      );
    }

    console.log("Analyzing image using Azure Vision API:", imageUrl);

    // Analyze the image using Azure Vision API
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

    // Concatenate all text from readResults into a single paragraph
    const concatenatedText = readResults.join(" ");
    console.log(JSON.stringify({ readResults, concatenatedText }, null, 2));

    return NextResponse.json({
      success: true,
      message: "Successfully processed the image",
      data: {
        concatenatedText,
        analysisResults: readResults,
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process image" },
      { status: 500 }
    );
  }
}
