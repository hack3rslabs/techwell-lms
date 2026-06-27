"use client"

import React, { useEffect, useRef, useState } from 'react'
import grapesjs, { Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import webpagePreset from 'grapesjs-preset-webpage'
import api from '@/lib/api'

interface GrapesJsEditorProps {
    initialHtml?: string
    initialCss?: string
    onSave: (html: string, css: string) => Promise<void>
}

export default function GrapesJsEditor({ initialHtml, initialCss, onSave }: GrapesJsEditorProps) {
    const editorRef = useRef<Editor | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!editorRef.current) {
            const editor = grapesjs.init({
                container: '#gjs',
                height: '100%',
                width: '100%',
                plugins: [webpagePreset],
                storageManager: false, // We will handle saving manually via our API
                assetManager: {
                    upload: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/marketing/landing-pages/assets/upload`,
                    uploadName: 'image',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    autoAdd: true,
                },
                components: initialHtml || '',
                style: initialCss || '',
            })

            // Add custom Save button to the top panel
            editor.Panels.addButton('options', [
                {
                    id: 'save-db',
                    className: 'fa fa-save',
                    command: 'save-db',
                    attributes: { title: 'Save Page' }
                }
            ])

            editor.Commands.add('save-db', {
                run: async (ed: Editor) => {
                    setIsSaving(true)
                    const html = ed.getHtml()
                    const css = ed.getCss()
                    await onSave(html, css || '')
                    setIsSaving(false)
                }
            })

            editorRef.current = editor
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy()
                editorRef.current = null
            }
        }
    }, [])

    return (
        <div className="w-full h-full relative">
            {isSaving && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center flex-col text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    <p>Saving changes...</p>
                </div>
            )}
            <div id="gjs" className="h-full w-full overflow-hidden border-0"></div>
        </div>
    )
}
