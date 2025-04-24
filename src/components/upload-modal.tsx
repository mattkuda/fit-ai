import { useState } from "react"
import { Button } from "@/components/ui/button"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File, additionalInstructions?: string) => Promise<void>
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [additionalInstructions, setAdditionalInstructions] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
        if (selectedFile) {
            setIsLoading(true)
            try {
                await onUpload(selectedFile, additionalInstructions)
                onClose()
            } catch (error) {
                console.error("Error uploading file:", error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        Upload Your Photo
                    </Dialog.Title>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer block"
                            >
                                {previewUrl ? (
                                    <div className="relative aspect-square">
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <p className="text-sm text-gray-500">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PNG or JPG (max. 10MB)
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="instructions" className="text-sm font-medium">
                                Additional Instructions (optional)
                            </label>
                            <textarea
                                id="instructions"
                                value={additionalInstructions}
                                onChange={(e) => setAdditionalInstructions(e.target.value)}
                                placeholder="Add any specific instructions for the AI (e.g., 'Make the background white', 'Keep my hair style')"
                                className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedFile || isLoading}
                            >
                                {isLoading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
} 