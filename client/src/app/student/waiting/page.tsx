'use client';

import { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext'; // Corrected relative path again for build system

export default function StudentWaitingPage() {
    const { socket } = useSocket();

    // This useEffect hook listens for the signal from the server to start the poll
    useEffect(() => {
        if (socket) {
            const handleNewQuestion = () => {
                // When a new question is broadcast by the teacher, navigate to the poll page
                window.location.href = '/student/poll';
            };

            socket.on('new_question', handleNewQuestion);

            // It's good practice to clean up the listener when the component unmounts
            return () => {
                socket.off('new_question', handleNewQuestion);
            };
        }
    }, [socket]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F2] font-sans">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#7765DA]"></div>
                <h1 className="text-3xl font-bold text-[#373737] mt-8">
                    Waiting for the teacher...
                </h1>
                <p className="text-lg text-[#6E6E6E] mt-2">
                    The poll will begin shortly.
                </p>
            </div>
        </main>
    );
}
