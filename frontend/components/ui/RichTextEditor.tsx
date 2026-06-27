import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { uploadApi } from '@/lib/api';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');
        // A functional component wrapper is needed to forward refs if we needed to, 
        // but dynamic handles the basic component
        return function ForwardedQuill(props: any) {
            return <RQ {...props} />;
        };
    },
    { ssr: false, loading: () => <div className="h-32 w-full animate-pulse bg-muted rounded-md border" /> }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Custom image handler to upload image to our server instead of Base64
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                // Upload via API
                const res = await uploadApi.upload(formData);
                const url = res.data.url;

                // Insert into editor
                // To get the quill instance from the dynamic import is tricky, 
                // so we use a standard class based approach internally if we had a direct ref.
                // For simplicity with dynamic import, we'll try to get it from the DOM or wrap it differently if it fails.
                
                // Fallback: If we can't easily grab the ref instance due to dynamic import wrapper,
                // we can just append it to the current value, but that's not cursor-aware.
                // Let's implement a safe cursor-aware insert if the ref works.
                if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1);
                } else {
                    // Fallback if ref is unavailable
                    onChange(value + `<img src="${url}" alt="Uploaded Image" />`);
                }

            } catch (error) {
                console.error('Image upload failed:', error);
                alert('Failed to upload image. Please try again.');
            } finally {
                setIsUploading(false);
            }
        };
    };

    // Memoize modules to prevent re-rendering issues with Quill
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [value]);

    return (
        <div className="relative">
            {isUploading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-md">
                    <span className="text-sm font-medium animate-pulse text-primary">Uploading Image...</span>
                </div>
            )}
            <ReactQuill 
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder || 'Start typing...'}
                className="bg-white rounded-md max-h-[500px] overflow-y-auto"
            />
        </div>
    );
}
