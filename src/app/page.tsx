"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { UploadModal } from "@/components/upload-modal"

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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({})

  const handleTryOn = (itemId: number) => {
    setSelectedItem(itemId)
    setIsModalOpen(true)
  }

  const handleUpload = async (file: File, additionalInstructions?: string) => {
    if (!selectedItem) return

    setIsLoading((prev) => ({ ...prev, [selectedItem]: true }))

    try {
      // Fetch the clothing item image
      const clothingImageResponse = await fetch(clothingItems[selectedItem - 1].image)
      const clothingImageBlob = await clothingImageResponse.blob()
      const clothingImageFile = new File([clothingImageBlob], "clothing.png", { type: "image/png" })

      const formData = new FormData()
      formData.append("userImage", file)
      formData.append("clothingImage", clothingImageFile)
      formData.append("clothingItem", clothingItems[selectedItem - 1].title)
      if (additionalInstructions) {
        formData.append("additionalInstructions", additionalInstructions)
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImages((prev) => ({
        ...prev,
        [selectedItem]: data.imageUrl,
      }))
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, [selectedItem]: false }))
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">See It On You</h1>
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {clothingItems.map((item) => (
          <div key={item.id} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src={generatedImages[item.id] || item.image}
                alt={item.title}
                fill
                className="object-cover object-top"
              />
              {!generatedImages[item.id] && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button onClick={() => handleTryOn(item.id)}>
                    Try It On
                  </Button>
                </div>
              )}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </main>
  )
}
