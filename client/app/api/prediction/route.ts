import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {


  const url = 'https://api.langflow.astra.datastax.com/lf/8c19da82-6d45-456d-93ac-52390f032bf9/api/v1/run/c96cf772-0461-4ded-bf63-5fb5495f3f6b'

  const requestData = {
    input_value: "Bank account upgrade ke liye phone call aur details share karne ka kaha gaya.",
    output_type: "chat",
    input_type: "chat",
    tweaks: {
  "ChatInput-dO6kb": {},
  "AstraVectorStoreComponent-ScXOs": {},
  "ParseData-mAaTU": {},
  "Prompt-bXywN": {},
  "ChatOutput-9iJ4Q": {},
  "SplitText-ssV2k": {},
  "File-v5mBI": {},
  "AstraVectorStoreComponent-VlL5K": {},
  "OpenAIEmbeddings-gGEgu": {},
  "OpenAIEmbeddings-L0gtq": {},
  "OpenAIModel-60RXk": {},
  "Prompt-5JrYa": {},
  "ChatOutput-bAgBe": {},
  "GroqModel-LzQl0": {}
}
}

  try {
    const data = await req.json()
    const args = data.args
    console.log("Args received", args)
    if (!args.situation) {
        return NextResponse.json({ error: "Missing situation in request body" }, { status: 400 })
      }
      requestData.input_value = args.situation;
    const response = await axios.post(url, 
      requestData,
      {
        params: { stream: false },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LANGFLOW_API_TOKEN}`
        }
      }
    )
    console.log('Langflow API response:', response.data)
    console.log('Langflow API response data:', JSON.stringify(response.data, null, 2));
    const langflowData = response.data;
    let aiMessage = '';
    if (langflowData.outputs && 
        langflowData.outputs[0].outputs && 
        langflowData.outputs[0].outputs[0].messages && 
        langflowData.outputs[0].outputs[0].messages[0].message) {
      aiMessage = langflowData.outputs[0].outputs[0].messages[0].message;
        }

      console.log(' AI message :', aiMessage);

    return NextResponse.json(aiMessage)
  } catch (error) {
    console.error('Error calling Langflow API:', error)
    return NextResponse.json({ message: 'Error calling Langflow API' }, { status: 500 })
  }
}