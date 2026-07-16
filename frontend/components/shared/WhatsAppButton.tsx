"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export function WhatsAppButton() {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const phoneNumber = "917997473473"; // The number provided by the user

    const handleClick = async () => {
        setIsLoading(true);
        try {
            // Track click as lead
            await api.post('/leads/whatsapp-click', {
                source: 'WhatsApp Floating Button',
                url: window.location.href,
            });
        } catch (error) {
            console.error('Failed to log WhatsApp click as lead:', error);
        } finally {
            setIsLoading(false);
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
                disabled={isLoading}
                className="relative group flex items-center justify-center p-4 rounded-full bg-green-500 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-green-600 hover:shadow-green-500/30 transition-all duration-300"
            >
                <MessageCircle className="w-6 h-6" />
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: "auto", opacity: 1, marginLeft: 12 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            className="overflow-hidden whitespace-nowrap font-semibold"
                        >
                            Chat with us
                        </motion.span>
                    )}
                </AnimatePresence>
                
                {/* Ping animation behind the button */}
                <span className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-20 group-hover:hidden pointer-events-none" />
            </button>
        </div>
    );
}
