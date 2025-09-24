'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext'; // Using a path alias for robustness

export default function StudentSetupPage() {
    const [name, setName] = useState('');
    const { socket } = useSocket();

    const handleContinue = () => {
        // We no longer need a room code, just the student's name
        if (socket && name.trim()) {
            socket.emit('join_poll', { name });
        }
    };

    useEffect(() => {
        if(socket) {
            const handleJoinSuccess = () => {
                // Navigate to the waiting page on successful join
                window.location.href = '/student/waiting';
            };

            const handleError = (data: { message: string }) => {
                alert(data.message);
            };

            socket.on('join_success', handleJoinSuccess);
            socket.on('error', handleError);

            return () => {
                socket.off('join_success', handleJoinSuccess);
                socket.off('error', handleError);
            }
        }
    }, [socket]);

    return (
        <main className="flex justify-center items-center min-h-screen bg-[#F2F2F2] font-sans p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                 <div className="text-center mb-8">
                    <div className="inline-block bg-[#E8E5FB] text-[#7765DA] font-semibold px-4 py-1 rounded-full text-sm mb-4">
                        ✨ Intervue Poll - Student
                    </div>
                    <h1 className="text-4xl font-bold text-[#373737]">
                        Let's Get Started
                    </h1>
                    <p className="text-lg text-[#6E6E6E] mt-3">
                       Enter your name to join the live poll.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-lg font-semibold text-[#373737] mb-2">
                            Enter Your Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-800 focus:ring-2 focus:ring-[#7765DA] focus:border-[#7765DA] transition"
                            placeholder="e.g., Rahul Bajaj"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleContinue}
                        disabled={!name.trim()}
                        className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all duration-300
                            ${!name.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#7765DA] hover:bg-[#5767D0] shadow-md hover:shadow-lg'}`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </main>
    );
}

