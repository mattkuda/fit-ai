"use client"
import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (files: File[], additionalInstructions?: string) => void
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([])
    const [additionalInstructions, setAdditionalInstructions] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || [])
        if (files.length + newFiles.length > 4) {
            alert("You can only upload up to 4 photos")
            return
        }
        setFiles([...files, ...newFiles])
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleSubmit = () => {
        if (files.length === 0) {
            alert("Please upload at least one photo")
            return
        }
        onUpload(files, additionalInstructions)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-4">Upload Reference Photos</h2>
                <p className="text-gray-600 mb-4">Upload up to 4 photos of yourself in different poses</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {files.map((file, index) => (
                        <div key={index} className="relative aspect-square">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Reference ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {files.length < 4 && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center">
                                <p className="text-gray-500">Click to add photo</p>
                                <p className="text-sm text-gray-400">({4 - files.length} remaining)</p>
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Additional Instructions (optional)</label>
                    <Textarea
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        placeholder="Any specific instructions for the AI..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Upload
                    </Button>
                </div>
            </div>
        </div>
    )
} 