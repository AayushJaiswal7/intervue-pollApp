    'use client';

    import { createContext, useContext, useEffect, useState } from 'react';
    import { io, Socket } from 'socket.io-client';

    // Define the shape of the context value
    interface SocketContextType {
        socket: Socket | null;
    }

    // Create the context with a default value of null
    const SocketContext = createContext<SocketContextType>({ socket: null });

    // Custom hook to use the socket context easily
    export const useSocket = () => {
        return useContext(SocketContext);
    };

    // The provider component that will wrap our application
    export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
        const [socket, setSocket] = useState<Socket | null>(null);

        useEffect(() => {
            // Create a new socket connection to our backend server
            const newSocket = io('http://localhost:8080');
            setSocket(newSocket);

            // Cleanup function to disconnect the socket when the component unmounts
            return () => {
                newSocket.disconnect();
            };
        }, []); // This effect runs only once when the app starts

        return (
            <SocketContext.Provider value={{ socket }}>
                {children}
            </SocketContext.Provider>
        );
    };
    
