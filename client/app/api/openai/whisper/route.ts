import { NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
});

export async function POST(req: Request) {
  try {
    console.log("Request received, starting to process...");

    // Parse the incoming request as FormData
    const formData = await req.formData();
    console.log("FormData parsed successfully");

    // Extract the audio file from the FormData
    const audioFile = formData.get("audioFile") as File;
    if (!audioFile) {
      console.log("No audio file provided in the request");
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log(`Audio file received: ${audioFile.name}`);

    // Generate a unique filename for the audio file
    const fileName = `${uuidv4()}${path.extname(audioFile.name)}`;
    const filePath = path.join("/tmp", fileName);
    console.log(`Generated file name: ${fileName}`);
    console.log(`Temporary file path: ${filePath}`);

    // Convert the audio file to a buffer and write it to a temporary location
    const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    console.log(`Audio file successfully written to ${filePath}`);

    // Call OpenAI Whisper API for transcription
    console.log("Sending audio file to OpenAI Whisper for transcription...");
    const transcription = await openai.audio.transcriptions.create({
      file: new File([fileBuffer], audioFile.name, { type: audioFile.type }),
      model: "whisper-1",
    });

    console.log("Transcription received from OpenAI:");
    console.log(transcription.text);

    // Clean up: remove the temporary file after processing
    await unlink(filePath);
    console.log(`Temporary file ${filePath} deleted`);

    // Return the transcription result as JSON
    return NextResponse.json({
      success: true,
      data: transcription.text,
    });
  } catch (error) {
    console.error("Error during Whisper transcription process:", error);
    return NextResponse.json(
      { success: false, error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
