import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.URLSCAN_API_KEY;

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  try {
    // Ensure the URL is valid
    const validUrl = new URL(url);

    // Scan URL
    const scanResponse = await fetch("https://urlscan.io/api/v1/scan/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": API_KEY || "",
      },
      body: JSON.stringify({
        url: validUrl.href,
        visibility: "public",
      }),
    });

    const scanData = await scanResponse.json();

    // Search for results
    const searchResponse = await fetch(
      `https://urlscan.io/api/v1/search/?q=domain:${validUrl.hostname}`
    );
    const searchData = await searchResponse.json();

    return NextResponse.json({
      scanResult: scanData,
      searchResult: searchData.results[0],
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        error: "Invalid URL or an error occurred while processing the request",
      },
      { status: 400 }
    );
  }
}
