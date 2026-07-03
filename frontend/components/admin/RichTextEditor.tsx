"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-md border" /> })

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    }

    return (
        <div className="bg-background rounded-md border text-foreground w-full">
            <ReactQuill 
                theme="snow" 
                value={value} 
                onChange={onChange} 
                modules={modules}
                className="rich-text-editor h-[300px] pb-12 w-full max-w-full"
            />
            <style jsx global>{`
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    border-color: hsl(var(--border));
                    background: hsl(var(--muted) / 0.5);
                }
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    border-color: hsl(var(--border));
                    font-family: inherit;
                    font-size: 1rem;
                }
                .dark .rich-text-editor .ql-snow .ql-stroke {
                    stroke: #e5e7eb;
                }
                .dark .rich-text-editor .ql-snow .ql-fill, 
                .dark .rich-text-editor .ql-snow .ql-stroke.ql-fill {
                    fill: #e5e7eb;
                }
                .dark .rich-text-editor .ql-snow .ql-picker {
                    color: #e5e7eb;
                }
                .dark .rich-text-editor .ql-snow.ql-toolbar button:hover, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:hover, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button:focus, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:focus, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button.ql-active, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button.ql-active, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label:hover, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label:hover, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label.ql-active, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item:hover, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item:hover, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
                    color: #3b82f6;
                }
                .dark .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button:focus .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:focus .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button:focus .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button:focus .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, 
                .dark .rich-text-editor .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
                    stroke: #3b82f6;
                }
                .dark .rich-text-editor .ql-snow .ql-picker-options {
                    background-color: hsl(var(--popover));
                    border-color: hsl(var(--border));
                }
            `}</style>
        </div>
    )
}
