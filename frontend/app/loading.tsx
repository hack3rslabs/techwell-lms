import Image from "next/image"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Rotating Outer Ring */}
                <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className="text-primary/20"
                    />
                    <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeDasharray="141 141" 
                        className="opacity-90"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Inner Pulsing Core */}
                <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-primary/5 animate-pulse" />

                {/* Logo */}
                <div className="absolute inset-0 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
                    {/* Only show the 'T' or crop the logo if it's too wide, but we'll show the whole thing scaled down */}
                    <div className="relative w-20 h-8">
                        <Image
                            src="/logo-light.png"
                            alt="Techwell Loading"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/logo-dark.png"
                            alt="Techwell Loading"
                            fill
                            className="hidden object-contain dark:block"
                            priority
                        />
                    </div>
                </div>
            </div>
            <h2 className="mt-8 text-sm font-semibold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
                Loading Techwell Experience...
            </h2>
        </div>
    )
}
