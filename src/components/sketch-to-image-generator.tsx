// eslint-disable-next-line 
// @ts-nocheck

"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, Eraser, Loader2, Sparkles, AlertCircle, RefreshCw, Droplet, Undo } from "lucide-react"
import { toast } from "sonner"
import { ART_STYLE, ART_STYLE_OPTIONS } from "../lib/utils"

const drawingColors = [
  { value: "#000000", label: "Black", tailwindClass: "bg-black" },
  { value: "#808080", label: "Gray", tailwindClass: "bg-gray-500" },

  { value: "#ffffff", label: "White", tailwindClass: "bg-white" },
  { value: "#ff0000", label: "Red", tailwindClass: "bg-red-500" },
  { value: "#0000ff", label: "Blue", tailwindClass: "bg-blue-500" },
  { value: "#008000", label: "Green", tailwindClass: "bg-green-500" },
  { value: "#800080", label: "Purple", tailwindClass: "bg-purple-500" },
  { value: "#ffa500", label: "Orange", tailwindClass: "bg-orange-500" },
  { value: "#ffff00", label: "Yellow", tailwindClass: "bg-yellow-400" },
  { value: "#964B00", label: "Brown", tailwindClass: "bg-amber-800" },
  { value: "#00FFFF", label: "Cyan", tailwindClass: "bg-cyan-400" },
]

type DrawingTool = "brush" | "eraser" | "bucket"
type DrawingState = {
  dataUrl: string
}

export default function SketchToImageGenerator() {
  const [artStyle, setArtStyle] = useState<ART_STYLE>(ART_STYLE.POKEMON_CHARACTER)
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("draw")
  const [error, setError] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(3)
  const [activeTool, setActiveTool] = useState<DrawingTool>("brush")
  const [undoStack, setUndoStack] = useState<DrawingState[]>([])
  const [currentStackIndex, setCurrentStackIndex] = useState(-1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastToolClickRef = useRef<number>(0)
  const isDrawingRef = useRef(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        // Save current drawing
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0)
        }

        // Resize canvas
        canvas.width = rect.width
        canvas.height = rect.height

        // Restore drawing
        if (tempCtx) {
          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height)
        } else {
          // If we couldn't save the drawing, at least set a white background
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }

    // Initial setup
    resizeCanvas()

    // If this is the first load and we have no undo history
    if (undoStack.length === 0) {
      // Set white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Save initial blank state
      const initialState: DrawingState = {
        dataUrl: canvas.toDataURL()
      }
      setUndoStack([initialState])
      setCurrentStackIndex(0)
    }

    // Set drawing style
    ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : currentColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"

    // Handle window resize
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Update drawing context when tool/color/width changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : currentColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
  }, [activeTool, currentColor, lineWidth])

  // Save the current canvas state to the undo stack
  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create new state
    const newState: DrawingState = {
      dataUrl: canvas.toDataURL()
    }

    // Update undo stack - remove any states after current index
    setUndoStack(prevStack => {
      const newStack = prevStack.slice(0, currentStackIndex + 1)
      return [...newStack, newState]
    })

    // Update current index
    setCurrentStackIndex(prev => prev + 1)
  }, [currentStackIndex])

  // Handle undo
  const handleUndo = useCallback(() => {
    if (currentStackIndex <= 0) return // Can't undo past initial state

    const newIndex = currentStackIndex - 1
    setCurrentStackIndex(newIndex)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Load previous state
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = undoStack[newIndex].dataUrl
  }, [currentStackIndex, undoStack])

  // // Handle redo
  // const handleRedo = useCallback(() => {
  //   if (currentStackIndex >= undoStack.length - 1) return // Can't redo past last state

  //   const newIndex = currentStackIndex + 1
  //   setCurrentStackIndex(newIndex)

  //   const canvas = canvasRef.current
  //   if (!canvas) return

  //   const ctx = canvas.getContext("2d")
  //   if (!ctx) return

  //   // Load next state
  //   const img = new Image()
  //   img.onload = () => {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height)
  //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  //   }
  //   img.src = undoStack[newIndex].dataUrl
  // }, [currentStackIndex, undoStack])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    saveCanvasState()
  }, [saveCanvasState])

  // Canvas event handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore if clicking on a button or too soon after tool click
      const now = Date.now()
      if (now - lastToolClickRef.current < 100) return

      const targetElement = e.target as HTMLElement
      if (targetElement.tagName === 'BUTTON' ||
        targetElement.closest('button') ||
        e.target !== canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (activeTool === "bucket") {
        saveCanvasState()
        floodFill(Math.floor(x), Math.floor(y), currentColor)
        return
      }

      isDrawingRef.current = true

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current || activeTool === "bucket" || e.target !== canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const handleMouseUp = () => {
      if (isDrawingRef.current) {
        saveCanvasState()
      }
      isDrawingRef.current = false
    }

    const handleTouchStart = (e: TouchEvent) => {
      const targetElement = e.target as HTMLElement
      if (targetElement.tagName === 'BUTTON' ||
        targetElement.closest('button') ||
        e.target !== canvas) return

      e.preventDefault() // Prevent scrolling

      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const y = e.touches[0].clientY - rect.top

      if (activeTool === "bucket") {
        saveCanvasState()
        floodFill(Math.floor(x), Math.floor(y), currentColor)
        return
      }

      isDrawingRef.current = true

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawingRef.current || activeTool === "bucket" || e.target !== canvas) return
      e.preventDefault()

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const y = e.touches[0].clientY - rect.top

      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const handleTouchEnd = () => {
      if (isDrawingRef.current) {
        saveCanvasState()
      }
      isDrawingRef.current = false
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [activeTool, currentColor, lineWidth, saveCanvasState])

  // Flood fill algorithm (paint bucket)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Convert hex color to RGBA
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
      } : { r: 0, g: 0, b: 0, a: 255 }
    }

    const fillRgb = hexToRgb(fillColor)

    // Get target color (the color we're replacing)
    const startPixelPos = (startY * canvas.width + startX) * 4
    const targetRgb = {
      r: data[startPixelPos],
      g: data[startPixelPos + 1],
      b: data[startPixelPos + 2],
      a: data[startPixelPos + 3]
    }

    // If target color is the same as fill color, do nothing
    if (
      targetRgb.r === fillRgb.r &&
      targetRgb.g === fillRgb.g &&
      targetRgb.b === fillRgb.b
    ) {
      return
    }

    // Basic queue-based flood fill
    const pixelStack = [[startX, startY]]
    const width = canvas.width
    const height = canvas.height

    const matchStartColor = (pixelPos: number) => {
      return (
        data[pixelPos] === targetRgb.r &&
        data[pixelPos + 1] === targetRgb.g &&
        data[pixelPos + 2] === targetRgb.b
      )
    }

    const colorPixel = (pixelPos: number) => {
      data[pixelPos] = fillRgb.r
      data[pixelPos + 1] = fillRgb.g
      data[pixelPos + 2] = fillRgb.b
      data[pixelPos + 3] = fillRgb.a
    }

    while (pixelStack.length > 0) {
      const newPos = pixelStack.pop()
      if (!newPos) continue

      const newX = newPos[0]
      let newY = newPos[1]

      let pixelPos = (newY * width + newX) * 4

      // Go up as long as the color matches and we're within the canvas
      let reachLeft = false
      let reachRight = false

      // Go up
      while (newY >= 0 && matchStartColor(pixelPos)) {
        pixelPos -= width * 4
        newY--
      }

      pixelPos += width * 4
      newY++

      // Go down
      while (newY < height && matchStartColor(pixelPos)) {
        colorPixel(pixelPos)

        if (newX > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([newX - 1, newY])
              reachLeft = true
            }
          } else if (reachLeft) {
            reachLeft = false
          }
        }

        if (newX < width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([newX + 1, newY])
              reachRight = true
            }
          } else if (reachRight) {
            reachRight = false
          }
        }

        pixelPos += width * 4
        newY++
      }
    }

    // Put the modified pixels back on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  // Tool change handlers
  const setToolMemoized = useCallback((tool: DrawingTool) => {
    if (tool === activeTool) return
    setActiveTool(tool)
  }, [activeTool])

  const setColorMemoized = useCallback((color: string) => {
    if (color === currentColor) return
    setCurrentColor(color)
    if (activeTool === "eraser") {
      setActiveTool("brush")
    }
  }, [currentColor, activeTool])

  const setLineWidthMemoized = useCallback((width: number) => {
    if (width === lineWidth) return
    setLineWidth(width)
  }, [lineWidth])

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // API submission
  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get image data
      let imageData
      if (activeTab === "draw") {
        imageData = canvasRef.current?.toDataURL("image/png")
      } else {
        imageData = uploadedImage
      }

      if (!imageData) {
        throw new Error("No image data available")
      }

      // Call API endpoint
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          instructions: additionalInstructions,
          artStyle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate images")
      }

      const data = await response.json()
      setResults(data.images || [])

      if (data.images?.length) {
        toast.success("Images generated successfully!")
      } else {
        toast.info("No images were generated. Try a different sketch or prompt.")
      }
    } catch (error) {
      console.error("Error generating images:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast.error("Failed to generate images. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="draw" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw">Draw Sketch</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative border border-border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[300px] md:h-[400px] touch-none bg-white"
                />
              </div>

              {/* Controls Panel */}
              <div className="flex flex-wrap gap-2 items-center mt-3" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <div className="flex flex-wrap gap-1 items-center p-2 rounded-md border border-border">
                  <div className="flex flex-wrap gap-1">
                    {drawingColors.map(color => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-md border ${currentColor === color.value && activeTool !== "eraser" ? 'ring-2 ring-zinc-300 ring-offset-1 ring-offset-zinc-800' : 'border-zinc-600'
                          } ${color.tailwindClass}`}
                        title={color.label}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          lastToolClickRef.current = Date.now();
                          setColorMemoized(color.value);
                        }}
                        aria-label={`Select ${color.label} color`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-1 items-center p-2 rounded-md border border-border">
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${activeTool === "brush" ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setToolMemoized("brush");
                    }}
                    title="Brush"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: currentColor }}
                    />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${activeTool === "eraser" ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setToolMemoized("eraser");
                    }}
                    title="Eraser"
                  >
                    <Eraser className="h-5 w-5 text-zinc-300" />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${activeTool === "bucket" ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setToolMemoized("bucket");
                    }}
                    title="Fill"
                  >
                    <Droplet className="h-5 w-5 text-zinc-300" />
                  </button>
                </div>

                <div className="flex gap-1 items-center p-2 rounded-md border border-border">
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${lineWidth === 1 ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setLineWidthMemoized(1);
                    }}
                    title="Thin line"
                  >
                    <div className="w-4 h-[1px] bg-zinc-300"></div>
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${lineWidth === 3 ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setLineWidthMemoized(3);
                    }}
                    title="Medium line"
                  >
                    <div className="w-4 h-[3px] bg-zinc-300"></div>
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${lineWidth === 5 ? 'bg-zinc-700' : ''} border border-zinc-600`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      setLineWidthMemoized(5);
                    }}
                    title="Thick line"
                  >
                    <div className="w-4 h-[5px] bg-zinc-300"></div>
                  </button>
                </div>

                <div className="flex gap-1 items-center ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      handleUndo();
                    }}
                    disabled={currentStackIndex <= 0}
                  >
                    <Undo className="h-4 w-4" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      lastToolClickRef.current = Date.now();
                      clearCanvas();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg h-[300px] md:h-[400px] relative">
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm"
                      onClick={() => setUploadedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 p-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drag and drop an image, or click to browse
                    </p>
                    <Button variant="secondary" onClick={triggerFileInput}>
                      Select Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="art-style" className="text-sm font-medium">
              Art Style
            </label>
            <Select value={artStyle} onValueChange={(value) => setArtStyle(value as ART_STYLE)}>
              <SelectTrigger id="art-style">
                <SelectValue placeholder="Select art style" />
              </SelectTrigger>
              <SelectContent>
                {ART_STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="instructions" className="text-sm font-medium">
              Additional Instructions
            </label>
            <Textarea
              id="instructions"
              placeholder="Add any specific details or instructions..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm border rounded-md border-destructive/50 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || (activeTab === "upload" && !uploadedImage)}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" /> Generate Images
            </>
          )}
        </Button>
      </div>

      {(isLoading || results.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {isLoading
              ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="aspect-square">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>
                ))
              : results.map((src, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`Generated image ${i + 1}`}
                    className="max-w-full object-contain"
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
