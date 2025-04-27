"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { UploadModal } from "@/components/upload-modal"
import { ImageViewerModal } from "@/components/image-viewer-modal"

const clothingItems = [
    {
        id: 1,
        title: "Essential Hoodie",
        price: "$45",
        image: "/hoodie.png",
    },
    {
        id: 2,
        title: "Zeroed In Tank",
        price: "$138",
        image: "/tanktop.png",
    },
    {
        id: 3,
        title: "Steady State Half Zip",
        price: "$138",
        image: "/halfzip.png",
    },
    {
        id: 4,
        title: "Casual Blazer",
        price: "$120",
        image: "/blazer.png",
    },
]

export default function FitAI() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<number | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
    const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})
    const [referencePhotos, setReferencePhotos] = useState<File[]>([])
    const [additionalInstructions, setAdditionalInstructions] = useState<string>("")

    const handleUpload = async (files: File[], additionalInstructions?: string) => {
        setReferencePhotos(files)
        setAdditionalInstructions(additionalInstructions || "")
    }

    const generateImage = async (itemId: number, photos: File[]) => {
        setIsLoading((prev) => ({ ...prev, [itemId]: true }))

        try {
            const clothingImageResponse = await fetch(clothingItems[itemId - 1].image)
            const clothingImageBlob = await clothingImageResponse.blob()
            const clothingImageFile = new File([clothingImageBlob], "clothing.png", {
                type: "image/png",
                lastModified: Date.now()
            })

            const formData = new FormData()
            photos.forEach((photo, index) => {
                formData.append(`userImage${index}`, photo)
            })
            formData.append("clothingImage", clothingImageFile)
            formData.append("clothingItem", clothingItems[itemId - 1].title)
            if (additionalInstructions) {
                formData.append("additionalInstructions", additionalInstructions)
            }

            const response = await fetch("/api/fit-ai", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to generate image")
            }

            const data = await response.json()
            setGeneratedImages((prev) => ({
                ...prev,
                [itemId]: `data:image/png;base64,${data.imageData}`,
            }))
        } catch (error) {
            console.error("Error generating image:", error)
        } finally {
            setIsLoading((prev) => ({ ...prev, [itemId]: false }))
        }
    }

    const handleApplyAll = async () => {
        if (referencePhotos.length === 0) {
            alert("Please upload reference photos first")
            return
        }

        const promises = clothingItems.map(item =>
            generateImage(item.id, referencePhotos)
        )

        await Promise.all(promises)
    }

    const handleItemClick = (itemId: number) => {
        setSelectedItem(itemId)
        setCurrentImageIndex(generatedImages[itemId] ? 1 : 0)
        setIsViewerModalOpen(true)
    }

    const handleImageIndexChange = (index: number) => {
        setCurrentImageIndex(index)
    }

    const getImagesForItem = (itemId: number) => {
        const item = clothingItems[itemId - 1]
        const images = [item.image]
        if (generatedImages[itemId]) {
            images.push(generatedImages[itemId])
        }
        return images
    }

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Fit AI ✨</h1>
            <p className="text-center text-gray-500 mb-8">Upload reference photos of yourself and we&apos;ll generate images of you wearing each of the products below.</p>

            <div className="flex justify-center mb-8">
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mr-4"
                >
                    Upload Reference Photos
                </Button>
                <Button
                    onClick={handleApplyAll}
                    variant="outline"
                    disabled={referencePhotos.length === 0}
                >
                    Apply All Products
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                {clothingItems.map((item) => (
                    <div key={item.id} className="relative group">
                        <div
                            className="aspect-square relative overflow-hidden rounded-lg cursor-pointer"
                            onClick={() => handleItemClick(item.id)}
                        >
                            <Image
                                src={generatedImages[item.id] || item.image}
                                alt={item.title}
                                fill
                                className="object-cover object-top"
                            />
                            {isLoading[item.id] && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="mt-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.price}</p>
                        </div>
                    </div>
                ))}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />

            {selectedItem && (
                <ImageViewerModal
                    isOpen={isViewerModalOpen}
                    onClose={() => setIsViewerModalOpen(false)}
                    images={getImagesForItem(selectedItem)}
                    currentIndex={currentImageIndex}
                    onChangeIndex={handleImageIndexChange}
                    productName={clothingItems[selectedItem - 1].title}
                    productPrice={clothingItems[selectedItem - 1].price}
                />
            )}
        </main>
    )
} 