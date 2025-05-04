"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
    const pathname = usePathname()

    const links = [
        { href: "/", label: "Action Figure" },
        { href: "/fit-ai", label: "Fit AI" },
        { href: "/furniture-ai", label: "Apartment AI" }
    ]

    return (
        <header className="border-b border-gray-200 dark:border-gray-800">
            <div className="container flex h-16 items-center px-4 sm:px-6">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors hover:text-foreground/80 ${pathname === link.href
                                ? "text-foreground font-semibold"
                                : "text-foreground/60"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
} 