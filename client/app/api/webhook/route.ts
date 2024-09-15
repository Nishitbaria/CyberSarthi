import { NextResponse } from 'next/server'
import Retell from 'retell-sdk';
// import { kv } from '@vercel/kv'
const client = new Retell({
    apiKey:  `${process.env.RETELL_API_KEY}`, // required
  });
// const retell = new Retell(process.env.RETELL_API_KEY)

export async function POST(req: Request) {
    // Verify the Retell signature
    const signature = req.headers.get('x-retell-signature')
    if (!signature) {
      console.error('Missing x-retell-signature header')
      return new NextResponse('Unauthorized', { status: 401 })
    }
  
    const body = await req.json()
  
    if (
      !Retell.verify(
        JSON.stringify(body),
        `${process.env.RETELL_API_KEY}`,
        signature
      )
    ) {
      console.error('Invalid signature')
      return new NextResponse('Unauthorized', { status: 401 })
    }
  
    const { event, call } = body
  
    switch (event) {
      case 'call_started':
        console.log('Call started event received', call.call_id)
        break
      case 'call_ended':
        console.log('Call ended event received', call.call_id)
        break
      case 'call_analyzed':
        console.log('Call analyzed event received', call.call_id)
        break
      default:
        console.log('Received an unknown event:', event)
    }
  
    // Acknowledge the receipt of the event
    return new NextResponse(null, { status: 204 })
  }