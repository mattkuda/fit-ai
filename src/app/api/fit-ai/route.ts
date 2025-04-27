import { NextResponse } from "next/server"
import OpenAI, { toFile } from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const clothingImage = formData.get("clothingImage") as File
        const clothingItem = formData.get("clothingItem") as string
        const additionalInstructions = formData.get("additionalInstructions") as string

        // Get all reference photos
        const referencePhotos: File[] = []
        let index = 0
        while (formData.has(`userImage${index}`)) {
            const photo = formData.get(`userImage${index}`) as File
            if (photo) referencePhotos.push(photo)
            index++
        }

        if (referencePhotos.length === 0 || !clothingImage || !clothingItem) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Convert all images to the format OpenAI expects
        const images = await Promise.all([
            ...referencePhotos.map(photo => toFile(photo, null, { type: photo.type })),
            toFile(clothingImage, null, { type: clothingImage.type })
        ])

        let prompt = `Create an image of the person in the reference photos (some at varying angles for full facial understanding) wearing the clothing item shown worn by the modelin the last photo (${clothingItem}). 
        The resulting image should maintain the exact facial features, skin tone, and body features of the person in the reference photos.
        The resulting image should maintain the exact pose, facial expression, and body position as the clothing model.
        The clothing should perfectly match the style, fit, and details shown in the clothing model photo.
        The final image should have professional studio lighting and a clean white background, similar to that of a Lululemon catalog.
        Add space above their head, so the image has the their full head shown down to at least their waist is visible, similar to the model clothing photo. Do not cut off their head or shoulders.`
        if (additionalInstructions) {
            prompt += `Additional instructions: ${additionalInstructions}`
        }

        const result = await openai.images.edit({
            model: "gpt-image-1",
            image: images,
            prompt,
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