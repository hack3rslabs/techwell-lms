import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

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

    // If it's a full HTML document, render it directly in an iframe-like full page
    const isFullDoc = bodyHtml.trim().toLowerCase().startsWith('<!doctype') || bodyHtml.trim().toLowerCase().startsWith('<html')

    if (isFullDoc) {
        // Inject custom CSS and JS into the full HTML document
        let finalHtml = bodyHtml
        if (page.customCss) {
            finalHtml = finalHtml.replace('</head>', `<style>${page.customCss}</style></head>`)
        }
        if (page.customJs) {
            finalHtml = finalHtml.replace('</body>', `<script>${page.customJs}</script></body>`)
        }
        if (page.headerCode) {
            finalHtml = finalHtml.replace('</head>', `${page.headerCode}</head>`)
        }

        return (
            <html lang="en">
                <body
                    style={{ margin: 0, padding: 0 }}
                    dangerouslySetInnerHTML={{ __html: finalHtml.replace(/^<!DOCTYPE[^>]*>/i, '').replace(/<\/?html[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '') }}
                />
            </html>
        )
    }

    // Partial HTML snippet — wrap it
    return (
        <html lang="en">
            <head>
                {page.seoTitle && <title>{page.seoTitle}</title>}
                {page.seoDesc && <meta name="description" content={page.seoDesc} />}
                {page.ogImage && <meta property="og:image" content={page.ogImage} />}
                {page.headerCode && <>{page.headerCode}</>}
                {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}
            </head>
            <body>
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                {page.customJs && <script dangerouslySetInnerHTML={{ __html: page.customJs }} />}
            </body>
        </html>
    )
}
