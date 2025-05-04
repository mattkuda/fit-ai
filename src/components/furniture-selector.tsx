"use client"
import Image from "next/image"
import { Card, CardContent } from "./ui/card"

interface FurnitureItem {
    id: number
    title: string
    price: string
    image: string
    prompt: string
}

interface FurnitureSelectorProps {
    items: FurnitureItem[]
    selectedItem: FurnitureItem | null
    onSelect: (item: FurnitureItem) => void
}

export function FurnitureSelector({ items, selectedItem, onSelect }: FurnitureSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
                <Card
                    key={item.id}
                    className={`cursor-pointer transition-all ${selectedItem?.id === item.id
                        ? "ring-2 ring-primary"
                        : "hover:ring-2 hover:ring-primary/50"
                        }`}
                    onClick={() => onSelect({
                        ...item,
                        image: item.image.replace("http://", "https://")
                    })}
                >
                    <CardContent className="p-4">
                        <div className="relative aspect-square mb-4">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.price}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 