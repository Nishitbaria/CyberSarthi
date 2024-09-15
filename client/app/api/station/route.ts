import { NextRequest, NextResponse } from "next/server";
import { getPoliceStationByCityAndName } from "@/lib/action/policeStation.action";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  const name = request.nextUrl.searchParams.get("name");

  if (!city || !name) {
    return NextResponse.json(
      { error: "Both city and police station name are required" },
      { status: 400 }
    );
  }

  try {
    const policeStation = await getPoliceStationByCityAndName(city, name);
    console.log("policeStation", policeStation);
    return NextResponse.json({
      fields: {
        name: policeStation.name,
        address: policeStation.address,
        phoneNumber: policeStation.phoneNumber,
        // Add any other relevant fields here
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      if (error.message === "Police station not found") {
        return NextResponse.json(
          { error: "Police station not found" },
          { status: 404 }
        );
      }
      if (error.message === "Invalid city or police station name format") {
        return NextResponse.json(
          { error: "Invalid city or police station name format" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
