"use client"

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

// Initialize socket instance
// Ensure this matches your backend URL
const URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5001";

export const socket: Socket = io(URL, {
    autoConnect: false,
    withCredentials: true,
});

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return { socket, isConnected };
};
