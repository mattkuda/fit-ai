import { NextResponse } from "next/server"
import OpenAI, { toFile } from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const roomImage = formData.get("roomImage") as File
        const furnitureImage = formData.get("furnitureImage") as File
        const maskImage = formData.get("maskImage") as File

        if (!roomImage || !maskImage || !furnitureImage) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const images = await Promise.all([
            toFile(roomImage, null, { type: roomImage.type }),
            toFile(furnitureImage, null, { type: furnitureImage.type })
        ])

        const maskImageAsUploadable = await toFile(maskImage, null, { type: maskImage.type })

        console.log("apartment image", images[0]);
        console.log("furniture image", images[1]);
        console.log("maskImageAsUploadable", maskImageAsUploadable);

        const prompt = `Using you image masking functionlaity, give me back the image of the apartment (first photo in images array)
        with the furniture (second photo in images array) inserted into the image.
        `
        const result = await openai.images.edit({
            model: "gpt-image-1",
            image: images,
            prompt: prompt,
            mask: maskImageAsUploadable,
            size: "1024x1024",
            quality: "high",
        })

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