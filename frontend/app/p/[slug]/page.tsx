import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function getPage(slug: string) {
    try {
        const res = await fetch(`${API_URL}/admin/marketing/landing-pages/public/${slug}`, {
            next: { revalidate: 60 }
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.page || null
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const page = await getPage(params.slug)
    if (!page) return { title: 'Page Not Found' }
    return {
        title: page.seoTitle || page.title,
        description: page.seoDesc || '',
        openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
    }
}

export default async function LandingPageRoute({ params }: { params: { slug: string } }) {
    const page = await getPage(params.slug)
    if (!page) return notFound()

    // Track view (fire-and-forget)
    fetch(`${API_URL}/admin/marketing/landing-pages/views/${params.slug}`, { method: 'POST' }).catch(() => {})

    // Prefer new raw htmlContent, fall back to legacy JSON content
    let bodyHtml = ''
    if (page.htmlContent) {
        bodyHtml = page.htmlContent
    } else if (page.content && typeof page.content === 'object' && 'html' in page.content) {
        bodyHtml = (page.content as any).html
    }

    // Strip out html/body/doctype tags if present so we can render cleanly inside Next.js layout
    const cleanBodyHtml = bodyHtml
        .replace(/^<!DOCTYPE[^>]*>/i, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '')

    return (
        <div className="w-full min-h-screen">
            {/* Inject Custom Header Code (Analytics, Meta, etc) */}
            {page.headerCode && (
                <div dangerouslySetInnerHTML={{ __html: page.headerCode }} suppressHydrationWarning />
            )}

            {/* Inject Custom CSS */}
            {page.customCss && (
                <style dangerouslySetInnerHTML={{ __html: page.customCss }} suppressHydrationWarning />
            )}

            {/* Render Body */}
            <div 
                className="cms-content-wrapper"
                dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(cleanBodyHtml, {
                        ADD_TAGS: ['style', 'iframe'],
                        FORCE_BODY: true
                    }) 
                }} 
            />

            {/* Inject Custom JS */}
            {page.customJs && (
                <script dangerouslySetInnerHTML={{ __html: page.customJs }} suppressHydrationWarning />
            )}
        </div>
    )
}
