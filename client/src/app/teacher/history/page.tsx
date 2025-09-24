'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext'; // Using corrected relative path

// Define types to avoid TypeScript errors
interface PollOption {
    id: number;
    text: string;
    isCorrect: boolean;
}
interface PollResults {
    id: number;
    percentage: number;
}


export default function HistoryPage() {
    const { socket } = useSocket();
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (socket) {
            // Request history from server on component mount
            socket.emit('get_history');

            const handlePollHistory = (data: any[]) => {
                setHistory(data);
            };

            socket.on('poll_history', handlePollHistory);

            return () => {
                socket.off('poll_history', handlePollHistory);
            };
        }
    }, [socket]);

    return (
        <main className="flex flex-col items-center min-h-screen bg-[#F2F2F2] font-sans p-8">
            <div className="w-full max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-[#373737]">Poll History</h1>
                    {/* Replaced Link with a standard anchor tag */}
                    <a href="/teacher/results" className="text-[#7765DA] font-semibold hover:underline">
                        Back to Live Poll
                    </a>
                </div>

                {history.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg mt-16">No past polls in this session yet.</p>
                ) : (
                    <div className="space-y-8">
                        {history.map((poll, index) => (
                             <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-xl font-bold text-gray-500 mb-4">Question {index + 1}</h2>
                                <div className="bg-[#373737] text-white p-6 rounded-lg mb-8">
                                    <p className="text-xl font-semibold">{poll.question}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {poll.options.map((option: PollOption) => {
                                        const result = poll.results.find((r: PollResults) => r.id === option.id);
                                        const percentage = result ? result.percentage : 0;
                                        return (
                                            <div key={option.id} className="border rounded-lg p-4 text-lg relative overflow-hidden bg-gray-50">
                                                <div 
                                                    className="absolute top-0 left-0 h-full bg-[#7765DA] opacity-30"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                                <div className="flex justify-between items-center relative z-10">
                                                    <span className={`font-semibold ${option.isCorrect ? 'text-green-600' : 'text-gray-800'}`}>
                                                        {option.text} {option.isCorrect && ' (Correct)'}
                                                    </span>
                                                    <span className="font-bold text-[#373737]">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

