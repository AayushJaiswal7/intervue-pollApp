'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext'; // Using alias path for robustness

interface Participant {
    id: string;
    name: string;
}

export default function TeacherPollPage() {
    // Workaround for useParams failing to import
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const { socket } = useSocket();
    const [participants, setParticipants] = useState<Participant[]>([]);

    useEffect(() => {
        // Extract roomCode from URL on the client side
        const pathSegments = window.location.pathname.split('/');
        const code = pathSegments[pathSegments.length - 1];
        setRoomCode(code);

        if (socket) {
            // Listen for updates to the participant list
            const handleUpdateParticipants = (newParticipants: Participant[]) => {
                setParticipants(newParticipants);
            };

            socket.on('update_participants', handleUpdateParticipants);

            // Clean up the listener when the component unmounts
            return () => {
                socket.off('update_participants', handleUpdateParticipants);
            };
        }
    }, [socket]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F2] p-8 font-sans">
            <div className="bg-white p-10 rounded-xl shadow-lg text-center w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-[#373737] mb-4">Poll is Live!</h1>
                <p className="text-lg text-[#6E6E6E] mb-6">Share this code with your students to have them join:</p>
                <div className="bg-[#E8E5FB] text-[#4F0DCE] text-4xl font-bold tracking-widest px-8 py-4 rounded-lg mb-8 select-all">
                    {roomCode || '...'}
                </div>
                <h2 className="text-2xl font-bold text-[#373737]">Participants ({participants.length})</h2>
                <div className="mt-4 text-left max-w-sm mx-auto border rounded-lg p-4 h-48 overflow-y-auto">
                    {participants.length > 0 ? (
                        <ul className="space-y-2">
                            {participants.map((p) => (
                                <li key={p.id} className="text-lg text-gray-800 bg-gray-100 px-3 py-2 rounded">
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 pt-12">Waiting for students to join...</p>
                    )}
                </div>
            </div>
        </main>
    );
}

