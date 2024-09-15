import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { name, contact, address, email, context, additionalInfo } =
    await request.json();

  if (!name || !contact || !address || !email || !context) {
    return NextResponse.json(
      { error: "All required data fields must be provided" },
      { status: 400 }
    );
  }

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cybercrime Complaint Report</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f2f5;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      header {
        background-color: #1a73e8;
        color: white;
        padding: 20px 0;
        text-align: center;
      }
      h1 {
        margin: 0;
        font-size: 2.5em;
      }
      .section {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        padding: 20px;
      }
      h2 {
        color: #1a73e8;
        border-bottom: 2px solid #1a73e8;
        padding-bottom: 10px;
        margin-top: 0;
      }
      h3 {
        color: #34a853;
      }
      .complainant-details p {
        margin: 5px 0;
      }
      .image-gallery {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      .image-item {
        width: calc(50% - 10px);
        margin-bottom: 20px;
      }
      .image-item img {
        max-width: 100%;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .download-link {
        display: inline-block;
        margin-top: 10px;
        color: #1a73e8;
        text-decoration: none;
      }
      .download-link:hover {
        text-decoration: underline;
      }
      .download-button {
        display: inline-block;
        background-color: #34a853;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s;
      }
      .download-button:hover {
        background-color: #2d8f49;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Cybercrime Complaint Report</h1>
    </header>
    <div class="container">
      <div class="section complainant-details">
        <h2>Complainant Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <div class="section">
        <h2>Context</h2>
        <h3>Image Analysis</h3>
        <p>${context.imageAnalysis}</p>
        <h3>Audio Transcription</h3>
        <p>${context.audioTranscription}</p>
      </div>
      <div class="section">
        <h2>Images</h2>
        <div class="image-gallery">
          ${context.imageUrls
            .map(
              (image: { url: string }, index: number) => `
            <div class="image-item">
              <img src="${image.url}" alt="Image ${index + 1}">
              <a href="${
                image.url
              }" download class="download-link">Download Image ${index + 1}</a>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <div class="section">
        <h2>Audio</h2>
        <a class="download-button" href="${
          context.audioUrls
        }" download>Download Audio</a>
      </div>
      <div class="section">
        <h2>WhatAiThings</h2>
        <p>${additionalInfo ? additionalInfo : "AdditionalData : "}</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    // Upload the PDF to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "AntiScam" },
      (error, result) => {
        if (error) {
          throw new Error("Failed to upload PDF to Cloudinary");
        }
        if (result) {
          return result.secure_url;
        } else {
          throw new Error("Failed to upload PDF to Cloudinary");
        }
      }
    );

    // Convert the buffer to a readable stream and pipe it to the upload stream
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(pdfBuffer);
    bufferStream.pipe(uploadResponse);

    // Wait for the upload to complete
    const pdfUrl = await new Promise((resolve, reject) => {
      uploadResponse.on("finish", () => {
        console.log(uploadResponse);
        return resolve(uploadResponse);
      });
      uploadResponse.on("error", reject);
    });

    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate and upload PDF" },
      { status: 500 }
    );
  }
}
