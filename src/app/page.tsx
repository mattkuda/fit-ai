"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/header"

export default function Home() {
  const [userImage, setUserImage] = useState<File | null>(null)
  const [name, setName] = useState("Matt")
  const [subheader, setSubheader] = useState("That guy on Youtube")
  const [items, setItems] = useState<string[]>(["burrito", "golden retriever", "kettlebell", "macbook pro", "yoga mat", "ribeye steak"])
  const [currentItem, setCurrentItem] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUserImage(file)
  }

  const addItem = () => {
    if (currentItem && items.length < 6) {
      setItems([...items, currentItem])
      setCurrentItem("")
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userImage || !name || !subheader || items.length === 0) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("userImage", userImage)
    formData.append("name", name)
    formData.append("subheader", subheader)
    items.forEach(item => formData.append("items", item))

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      if (data.imageData) {
        setResultImage(`data:image/png;base64,${data.imageData}`)
      } else {
        throw new Error("No image data received")
      }
    } catch (error) {
      setError(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center">Action Figure Generator</h1>
          <p className="text-gray-400 text-center mb-8">Create your custom action figure in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Your Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Figure Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="Enter figure name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subheader</label>
                <input
                  type="text"
                  value={subheader}
                  onChange={(e) => setSubheader(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="Enter subheader"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accessories (up to 6)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Add an accessory"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={items.length >= 6}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-medium disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Action Figure"}
            </button>
          </form>

          {resultImage && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Your Action Figure</h2>
              <div className="relative aspect-square max-w-2xl mx-auto">
                <Image
                  src={resultImage}
                  alt="Generated action figure"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
