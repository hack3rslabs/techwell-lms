import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import Link from "next/link";

async function getStoreStatus() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/shop/settings/status`, { cache: 'no-store' });
        const data = await res.json();
        return data?.data?.isStoreEnabled === true;
    } catch(e) {
        return false;
    }
}

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isEnabled = await getStoreStatus();

    if (!isEnabled) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-white dark:bg-zinc-950 font-sans">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Shop is Currently Closed</h1>
                <p className="text-zinc-500 mb-8 text-center max-w-md">Our store is undergoing maintenance or is currently disabled by the administrator. Please check back later.</p>
                <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-white dark:bg-zinc-950 font-sans">
            <ShopHeader />
            <main className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950">
                {children}
            </main>
            <ShopFooter />
        </div>
    );
}
