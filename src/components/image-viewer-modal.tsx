"use client"
import { Button } from "./ui/button"
import Image from "next/image"

interface ImageViewerModalProps {
    isOpen: boolean
    onClose: () => void
    images: string[]
    currentIndex: number
    onChangeIndex: (index: number) => void
    productName: string
    productPrice: string
}

export function ImageViewerModal({
    isOpen,
    onClose,
    images,
    currentIndex,
    onChangeIndex,
    productName,
    productPrice
}: ImageViewerModalProps) {
    if (!isOpen) return null

    const handlePrev = () => {
        onChangeIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
    }

    const handleNext = () => {
        onChangeIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
    }

    const handleAddToCart = () => {
        console.log(`Added ${productName} to cart`)
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="relative max-w-4xl w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative aspect-square">
                    <Image
                        src={images[currentIndex]}
                        alt={productName}
                        fill
                        className="object-contain"
                    />
                </div>

                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
                    <div className="text-white text-center">
                        <h3 className="text-xl font-bold">{productName}</h3>
                        <p className="text-gray-300">{productPrice}</p>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    )
} 