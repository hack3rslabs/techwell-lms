import { notFound } from 'next/navigation'
import StandaloneFormClient from './StandaloneFormClient'
import api from '@/lib/api'

export default async function StandaloneFormPage({ params }: { params: { id: string } }) {
    let form = null;
    try {
        const res = await api.get(`/admin/marketing/forms/public/${params.id}`);
        form = res.data.form;
    } catch (e) {
        // failed to fetch or 404
    }

    if (!form) return notFound()

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-primary/10 p-6 text-center border-b border-primary/20">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{form.title}</h1>
                </div>
                <div className="p-6">
                    <StandaloneFormClient form={form} />
                </div>
            </div>
        </div>
    )
}
