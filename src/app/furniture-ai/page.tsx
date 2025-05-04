"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { UploadModal } from "@/components/upload-modal"
import { CanvasEditor } from "@/components/canvas-editor"
import { FurnitureSelector } from "@/components/furniture-selector"
import { Header } from "@/components/header"

const furnitureItems = [
    {
        id: 1,
        title: "Modern Armchair",
        price: "$299",
        image: "/armchair.png",
        prompt: "A cozy white armchair placed in a modern living room"
    },
    {
        id: 2,
        title: "Coffee Table",
        price: "$199",
        image: "/coffee-table.png",
        prompt: "A sleek wooden coffee table in a contemporary living space"
    },
    {
        id: 3,
        title: "Painting",
        price: "$399",
        image: "/mona-lisa.png",
        prompt: "A painting of a woman"
    },
    {
        id: 4,
        title: "Floor Plant",
        price: "$49",
        image: "/plant.png",
        prompt: "A large floor plant"
    }
]

export default function FurnitureAI() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [originalRoomImage, setOriginalRoomImage] = useState<File | null>(null)
    const [roomMaskImage, setRoomMaskImage] = useState<File | null>(null)
    const [roomMaskPreview, setRoomMaskPreview] = useState<string | null>(null)
    const [selectedFurniture, setSelectedFurniture] = useState<typeof furnitureItems[0] | null>(null)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpload = async (files: File[]) => {
        if (files.length > 0) {
            setOriginalRoomImage(files[0])
            setIsUploadModalOpen(false)
        }
    }

    const handleMaskComplete = (maskFile: File) => {
        setRoomMaskImage(maskFile)

        // Create a preview URL for the mask
        const maskPreviewUrl = URL.createObjectURL(maskFile)
        setRoomMaskPreview(maskPreviewUrl)
    }

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (roomMaskPreview) {
                URL.revokeObjectURL(roomMaskPreview)
            }
        }
    }, [roomMaskPreview])

    const handleGenerate = async () => {
        if (!originalRoomImage || !roomMaskImage || !selectedFurniture) {
            alert("Please complete all steps: upload room photo, select furniture, and create mask")
            return
        }

        setIsLoading(true)

        try {
            // Fetch the furniture image as a blob
            const furnitureImageResponse = await fetch(selectedFurniture.image)
            const furnitureImageBlob = await furnitureImageResponse.blob()
            const furnitureImageFile = new File(
                [furnitureImageBlob],
                "furniture.png",
                { type: "image/png" }
            )

            const formData = new FormData()
            formData.append("roomImage", originalRoomImage)
            formData.append("maskImage", roomMaskImage)
            formData.append("furnitureImage", furnitureImageFile)
            formData.append("prompt", selectedFurniture.prompt)

            const response = await fetch("/api/furniture-generate", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to generate image")
            }

            const data = await response.json()
            setGeneratedImage(`data:image/png;base64,${data.imageData}`)
        } catch (error) {
            console.error("Error generating image:", error)
            alert("Failed to generate image. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Header />
            <main className="min-h-screen p-8">
                <h1 className="text-4xl font-bold text-center mb-8">Apartment AI ✨</h1>
                <p className="text-center text-gray-500 mb-8">Upload a photo of your room, and see how furniture would look in any specific location.</p>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Step 1: Upload Room Photo */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Step 1: Upload Room Photo</h2>
                        <p className="text-sm text-gray-500">Upload a square photo of your room. The image will be automatically cropped to a square format.</p>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => setIsUploadModalOpen(true)}
                                disabled={!!originalRoomImage}
                            >
                                {originalRoomImage ? "Photo Uploaded" : "Upload Room Photo"}
                            </Button>
                            {originalRoomImage && (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                                    <Image
                                        src={URL.createObjectURL(originalRoomImage)}
                                        alt="Uploaded room"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Select Furniture */}
                    {originalRoomImage && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">Step 2: Choose Furniture</h2>
                            <p className="text-sm text-gray-500">Select the furniture you want to place in your room.</p>
                            <FurnitureSelector
                                items={furnitureItems}
                                selectedItem={selectedFurniture}
                                onSelect={setSelectedFurniture}
                            />
                        </div>
                    )}

                    {/* Step 3: Create Mask */}
                    {selectedFurniture && originalRoomImage && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">Step 3: Mark Where to Place Furniture</h2>
                            <p className="text-sm text-gray-500">Use the eraser tool to mark the area where you want to place the furniture. The marked area will be replaced with the selected furniture.</p>
                            <CanvasEditor
                                image={originalRoomImage}
                                onMaskComplete={handleMaskComplete}
                            />
                        </div>
                    )}

                    {/* Mask Preview */}
                    {roomMaskPreview && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">Mask Preview</h2>
                            <p className="text-sm text-gray-500">This is your mask. The transparent areas (shown in red) are where the furniture will be placed.</p>
                            <div className="relative aspect-square max-h-[400px] w-full border border-border rounded-lg overflow-hidden bg-red-500">
                                <Image
                                    src={roomMaskPreview}
                                    alt="Mask preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* Generate Button */}
                    {roomMaskImage && (
                        <div className="flex justify-center">
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                size="lg"
                            >
                                {isLoading ? "Generating..." : "Generate"}
                            </Button>
                        </div>
                    )}

                    {/* Result */}
                    {generatedImage && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">Result</h2>
                            <div className="relative aspect-square">
                                <Image
                                    src={generatedImage}
                                    alt="Generated room with furniture"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <UploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUpload={handleUpload}
                />
            </main>
        </>
    )
} 