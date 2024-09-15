import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/action/user.action";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await getUserById(id);
    console.log("user", user);
    return NextResponse.json({ fields: user.name });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message === "Invalid user ID format") {
        return NextResponse.json(
          { error: "Invalid user ID format" },
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
