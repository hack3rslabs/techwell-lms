import React from 'react'
import { Info } from 'lucide-react'

export function ImageUploadInfo() {
    return (
        <div className="flex items-start gap-2 mt-2 p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-xs text-indigo-700/80">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <div>
                <p className="font-semibold text-indigo-900/90 mb-0.5">Image Upload Requirements</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li><strong>Format:</strong> <span className="font-medium text-indigo-900">.webp</span> or <span className="font-medium text-indigo-900">.svg</span> recommended for best quality/performance. (JPEG/PNG supported)</li>
                    <li><strong>Size:</strong> Max 2MB file size.</li>
                    <li><strong>Quality:</strong> Ensure high pixel density for retina displays. Avoid blurry or distorted images.</li>
                </ul>
            </div>
        </div>
    )
}
