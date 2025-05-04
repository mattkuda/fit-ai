"use client"
import { useRef, useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Eraser, RefreshCw, Info } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

interface CanvasEditorProps {
    image: File
    onMaskComplete: (maskFile: File) => void
}

export function CanvasEditor({ image, onMaskComplete }: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [imageUrl, setImageUrl] = useState<string>("")
    const baseEraserSize = 30 // Base size for the eraser

    useEffect(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
            setImageUrl(e.target?.result as string)
        }
        reader.readAsDataURL(image)
    }, [image])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !imageUrl) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size to match image, ensuring it's square
        const img = new Image()
        img.onload = () => {
            const size = Math.max(img.width, img.height)
            canvas.width = size
            canvas.height = size

            // Fill with white background first
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, size, size)

            // Center the image in the square canvas
            const x = (size - img.width) / 2
            const y = (size - img.height) / 2
            ctx.drawImage(img, x, y)
        }
        img.src = imageUrl
    }, [imageUrl])

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0, scale: 1 }

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
            scale: Math.max(scaleX, scaleY)
        }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set to erase mode
        ctx.globalCompositeOperation = "destination-out"

        const { x, y, scale } = getCanvasCoordinates(e)
        ctx.lineWidth = baseEraserSize * scale
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { x, y, scale } = getCanvasCoordinates(e)
        ctx.lineWidth = baseEraserSize * scale
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const handleMouseUp = () => {
        setIsDrawing(false)
    }

    const handleClear = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Reset the globalCompositeOperation to default
        ctx.globalCompositeOperation = "source-over"

        // Clear the canvas and redraw the image
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const img = new Image()
        img.onload = () => {
            const size = Math.max(img.width, img.height)

            // Fill with white background first
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, size, size)

            const x = (size - img.width) / 2
            const y = (size - img.height) / 2
            ctx.drawImage(img, x, y)
        }
        img.src = imageUrl
    }

    const handleComplete = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Reset to default drawing mode before saving
        ctx.globalCompositeOperation = "source-over"

        // Create a new canvas for the mask
        const maskCanvas = document.createElement("canvas")
        maskCanvas.width = canvas.width
        maskCanvas.height = canvas.height
        const maskCtx = maskCanvas.getContext("2d")

        if (!maskCtx) return

        // Copy the current canvas to the mask canvas
        maskCtx.drawImage(canvas, 0, 0)

        // Convert mask canvas to PNG with transparency
        const maskDataUrl = maskCanvas.toDataURL("image/png")

        // Convert data URL to File
        fetch(maskDataUrl)
            .then(res => res.blob())
            .then(blob => {
                const maskFile = new File([blob], "mask.png", { type: "image/png" })
                onMaskComplete(maskFile)
            })
    }

    return (
        <div className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Use the eraser tool to clear the areas where you want to place the furniture. The cleared (transparent) areas will be replaced with the selected furniture.
                </AlertDescription>
            </Alert>

            <div className="relative border border-border rounded-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full aspect-square touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>

            <div className="flex gap-2">
                <Button
                    variant="default"
                    className="flex items-center gap-2"
                >
                    <Eraser className="h-4 w-4" />
                    Eraser
                </Button>
                <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Clear
                </Button>
                <Button
                    onClick={handleComplete}
                    className="flex items-center gap-2 ml-auto"
                >
                    Complete Mask
                </Button>
            </div>
        </div>
    )
} 