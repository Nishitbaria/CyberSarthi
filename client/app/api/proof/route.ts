import { NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

export async function POST(req: Request) {
  console.log("POST call on checkDoc")

  // Check for required headers
  if (req.headers.get("Content-Type") !== "application/json") {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 })
  }

  try {
    // Get input from body
    const data = await req.json()
    const args = data.args
    console.log("Args received", args)

    if (!args["user id"]) {
      return NextResponse.json({ error: "Missing 'user id' in request body" }, { status: 400 })
    }

    // Query the user from the database
    // const user = await prisma.user.findUnique({
    //   where: { id: args["user id"] },
    //   select: { context: true }
    // })

    // console.log(user)
const context ="mujhe bank se account upgrade karne ke liye phone aaya that unhone mujhe details share karne ko bola";
    let response: string
    if (context !== null) {
      response = "Documents are uploaded"
    } else {
      response = "No documents are uploaded"
    }

    console.log("checkDoc output is ", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in checkDoc API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    console.log("checkDoc API call completed")
  }
}