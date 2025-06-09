import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system: `Tu es un assistant virtuel intelligent et serviable. Tu peux répondre à toutes sortes de questions en français. 
      Sois précis, utile et amical dans tes réponses. Si tu ne connais pas quelque chose, dis-le honnêtement.`,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Erreur API Chat:", error)
    return new Response("Erreur interne du serveur", { status: 500 })
  }
}
