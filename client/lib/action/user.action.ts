"use server";
import { userCreateFormData } from "@/types";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";

interface UserCreateFormData {
  name: string;
  contact: string;
  address: string;
  email: string;
  context: {
    chats: Array<{ key: string; value: string }>;
    voiceRecording: Array<{ key: string; value: string }>;
    imageAnalysis: string | null;
    audioTranscription: string | null;
  };
}

export const createUser = async (user: UserCreateFormData) => {
  try {
    await connectToDatabase();
    if (!user) throw new Error("Data is required");
    const { name, contact, address, email, context } = user;

    const newUser = await User.create({
      name,
      contact,
      address,
      email,
      context,
    });
    console.log("context->", context);

    if (!newUser) throw new Error("User not created");

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating user: ${error}`);
  }
};
export async function getUserById(id: string) {
  if (!id) {
    throw new Error("User ID is required");
  }

  try {
    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // Return the user data
    return user.toObject();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching user: ${error.message}`);
    } else {
      throw new Error("An unexpected error occurred while fetching the user");
    }
  }
}

export async function getUser(id: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
}
