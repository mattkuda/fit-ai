import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const userImage = formData.get("userImage") as File
        const name = formData.get("name") as string
        const subheader = formData.get("subheader") as string
        const items = formData.getAll("items") as string[]

        if (!userImage || !name || !subheader || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const itemsList = items.slice(0, 6).join(", ")
        const prompt = `Draw an action figure toy (barbie doll) of the person in this photo. The figure should be full figure and displayed in it original blister pack packaging. On top of the box is the name of the toy "${name}" with "${subheader}" across a single line of text. In the blister pack packaging, next to the figure show the toy's accessories including ${itemsList}`

        const result = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "1024x1024",
            quality: "high",
        })

        console.log('result', result)

        if (!result.data?.[0]?.b64_json) {
            throw new Error("No image data returned from OpenAI")
        }

        return NextResponse.json({ imageData: result.data[0].b64_json })
    } catch (error) {
        console.error("Error generating image:", error)
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        )
    }
} 