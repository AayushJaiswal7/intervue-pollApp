'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<{ socket: Socket | null }>({ socket: null });
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    useEffect(() => {
        const newSocket = io('https://intervue-pollapp-server.onrender.com');
        setSocket(newSocket);
        return () => { newSocket.disconnect(); };
    }, []);
    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};