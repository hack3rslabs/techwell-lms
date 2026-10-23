"use client"

import * as React from "react"
import Image from "next/image"
import { getFullImageUrl } from "@/lib/image-utils"

interface CourseImageProps {
    sources: (string | undefined | null)[]
    alt: string
    className?: string
    sizes?: string
    priority?: boolean
    onClick?: () => void
}

export function CourseImage({
    sources,
    alt,
    className,
    sizes,
    priority,
    onClick,
}: CourseImageProps) {
    const sourceKey = sources.filter(Boolean).join("|")
    const imageSources = [...new Set(sources.filter((source): source is string => Boolean(source)))]
    const [sourceIndex, setSourceIndex] = React.useState(0)

    React.useEffect(() => {
        setSourceIndex(0)
    }, [sourceKey])

    const source = imageSources[sourceIndex]
    if (!source) return null

    return (
        <Image
            src={getFullImageUrl(source)}
            alt={alt}
            fill
            unoptimized
            sizes={sizes}
            priority={priority}
            className={className}
            onClick={onClick}
            onError={() => setSourceIndex(index => index + 1)}
        />
    )
}
