import PoliceStation from "../database/policestation.model";
import { connectToDatabase } from "../mongoose";

export async function getPoliceStationByCityAndName(
  city: string,
  name: string
) {
  if (!city || !name) {
    throw new Error("Both city and police station name are required");
  }

  // Sanitize inputs
  const sanitizedName = name.trim();

  if (sanitizedName.length < 2) {
    throw new Error("Invalid police station name format");
  }

  try {
    await connectToDatabase();
    const policeStation = await PoliceStation.findOne({
      name: { $regex: new RegExp(sanitizedName, "i") },
    });

    if (!policeStation) {
      throw new Error("Police station not found");
    }

    return policeStation;
  } catch (error) {
    console.error("Error fetching police station:", error);
    throw error;
  }
}
