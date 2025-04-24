import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        console.log(formData);
        const userImage = formData.get("userImage") as File
        const clothingImage = formData.get("clothingImage") as File
        const clothingItem = formData.get("clothingItem") as string
        const additionalInstructions = formData.get("additionalInstructions") as string

        if (!userImage || !clothingImage || !clothingItem) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        let prompt = `Generate an image of a person wearing ${clothingItem}. The person should be in the same pose and position as the user's reference image.
        The image should have studio lighting and a white background, similar to that of a Lululemon catalog.
        Use the clothing item image as a reference for the exact style, fit, and details of the garment.`
        if (additionalInstructions) {
            prompt += ` ${additionalInstructions}`
        }

        const result = await openai.images.edit({
            model: "gpt-image-1",
            image: userImage,
            prompt,
            size: "1024x1024",
            quality: "high",
        })

        if (!result.data?.[0]?.url) {
            throw new Error("No image URL returned from OpenAI")
        }

        return NextResponse.json({ imageUrl: result.data[0].url })
    } catch (error) {
        console.error("Error generating image:", error)
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        )
    }
} 