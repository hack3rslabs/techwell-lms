"use client";

import React, { useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { uploadApi } from '@/lib/api';
import { getFullImageUrl } from '@/lib/image-utils';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-muted-foreground animate-pulse">Loading Editor...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                // Upload image to server
                const res = await uploadApi.upload(formData);
                const imageUrl = getFullImageUrl(res.data.url);

                // Insert into editor
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection();
                    const position = range ? range.index : 0;
                    quill.insertEmbed(position, 'image', imageUrl);
                }
            } catch (error) {
                console.error("Failed to upload image", error);
                alert("Failed to upload image");
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction
                [{ 'align': [] }],
                ['link', 'image', 'video', 'blockquote', 'code-block'],
                ['clean']                                         // remove formatting button
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script', 'list', 'bullet', 'indent',
        'direction', 'align',
        'link', 'image', 'video', 'blockquote', 'code-block'
    ];

    return (
        <div className="w-full prose-editor-container">
            <ReactQuill 
                // @ts-expect-error - ReactQuill types are outdated for React 19/Next 14 ref forwarding
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Start writing your rich text content..."}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[400px]"
            />
            <style jsx global>{`
                .quill {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .dark .quill {
                    border-color: #1e293b;
                }
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    background-color: #f8fafc;
                    padding: 12px;
                }
                .dark .ql-toolbar.ql-snow {
                    border-bottom-color: #1e293b;
                    background-color: #0f172a;
                }
                .ql-container.ql-snow {
                    border: none;
                    font-size: 1.125rem;
                    font-family: inherit;
                    min-height: 400px;
                }
                .ql-editor {
                    min-height: 400px;
                    padding: 1.5rem;
                    line-height: 1.8;
                }
                .dark .ql-stroke {
                    stroke: #94a3b8 !important;
                }
                .dark .ql-fill {
                    fill: #94a3b8 !important;
                }
                .dark .ql-picker {
                    color: #94a3b8 !important;
                }
                .dark .ql-picker-options {
                    background-color: #0f172a !important;
                    border-color: #1e293b !important;
                }
            `}</style>
        </div>
    );
}
