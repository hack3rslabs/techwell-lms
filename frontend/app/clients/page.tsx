"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Globe, Building2, ExternalLink } from 'lucide-react'

interface Client {
    id: string
    name: string
    description: string | null
    url: string | null
}

export default function ClientsPage() {
    const [clients, setClients] = React.useState<Client[]>([])
    const [loading, setLoading] = React.useState(true)

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

    React.useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await axios.get(`${apiBase}/clients`)
                setClients(res.data)
            } catch (error) {
                console.error('Failed to load clients', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClients()
    }, [apiBase])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-20 px-4">
            <div className="container max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-2 shadow-sm">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-semibold tracking-wide uppercase">Our Network</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Our Valued Clients
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        We are proud to partner with leading organizations across the globe, delivering cutting-edge technology and talent solutions.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {clients.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <Globe className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Growing our network</h3>
                                <p className="text-zinc-500 mt-2">We are constantly adding new partners and clients.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">
                                {clients.map((client) => (
                                    <Card key={client.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full">
                                        <div className="h-2 w-full bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xl font-bold flex items-center justify-between">
                                                <span className="truncate pr-4">{client.name}</span>
                                                <Building2 className="h-5 w-5 text-primary opacity-50 flex-shrink-0" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col pt-2">
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                                                {client.description || 'A valued partner in our growing ecosystem of technological excellence.'}
                                            </p>
                                            
                                            {client.url && (
                                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                    <a 
                                                        href={client.url.startsWith('http') ? client.url : `https://${client.url}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-semibold text-primary hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        Visit Website
                                                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
