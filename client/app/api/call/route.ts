import { NextResponse } from 'next/server'
import Retell from 'retell-sdk';

// Initialize Retell client
const client = new Retell({
    apiKey:  `${process.env.RETELL_API_KEY}`, // required
  });

export async function POST(req: Request) {
  try {
    const { userId, name, contact, address } = await req.json()

    // if (!userId || !name || !contact || !address) {
    //   return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    // }

    const retellLlmDynamicVariables = {
      "user id": userId.toString() || 'user123',
      "user name": name || 'John Doe',
      "contact number": contact || '8401282183',
      "address": address || `Tarsali Vadodara, Gujarat, India`,
    }

    console.log('Retell LLM Dynamic Variables:', retellLlmDynamicVariables)

    const call = await client.call.createPhoneCall({
      from_number: "+19367554652",
      to_number: "+918401282183",
      retell_llm_dynamic_variables: retellLlmDynamicVariables,
    })

    return NextResponse.json({ callId: call.call_id })
  } catch (error) {
    console.error('Error triggering Retell call:', error)
    return NextResponse.json({ error: 'Failed to trigger call' }, { status: 500 })
  }
}