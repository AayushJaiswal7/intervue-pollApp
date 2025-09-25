'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

// Interfaces for the data structure remain the same
interface PollOptionHistory {
    id: number;
    text: string;
}
interface PollResultHistory {
    id: number;
    count: number;
    percentage: number;
}
interface PollHistoryItem {
    question: string;
    options: PollOptionHistory[];
    results: PollResultHistory[];
    correctAnswerId: number;
}

export default function HistoryPage() {
    const { socket } = useSocket();
    const [history, setHistory] = useState<PollHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (socket) {
            socket.emit('get_history');
            const handlePollHistory = (data: PollHistoryItem[]) => {
                setHistory(data);
                setIsLoading(false);
            };
            socket.on('poll_history', handlePollHistory);
            return () => {
                socket.off('poll_history', handlePollHistory);
            };
        }
    }, [socket]);

    return (
        <main className="flex justify-center min-h-screen bg-white font-sans p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-3xl">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">View Poll History</h1>
                    <Link href="/teacher/results" className="text-purple-600 font-semibold hover:underline">
                        ← Back to Live Poll
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-center text-gray-500 text-lg mt-16">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg mt-16">No past polls in this session yet.</div>
                ) : (
                    <div className="space-y-12">
                        {history.map((poll, index) => (
                            <div key={index}>
                                <h2 className="text-2xl font-bold text-gray-700 mb-4">Question {index + 1}</h2>
                                <div className="bg-gray-700 text-white p-5 rounded-lg mb-6 shadow-md">
                                    <p className="text-xl font-semibold">{poll.question}</p>
                                </div>
                                <div className="space-y-3">
                                    {poll.options.map((option) => {
                                        const result = poll.results.find(r => r.id === option.id);
                                        const percentage = result ? result.percentage : 0;
                                        const isCorrect = poll.correctAnswerId === option.id;

                                        return (
                                            <div key={option.id} className={`border rounded-lg p-3 transition-all ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex items-center justify-between gap-4">
                                                    {/* Left side: Number and Text */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                            {poll.options.indexOf(option) + 1}
                                                        </div>
                                                        <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-gray-800'}`}>
                                                            {option.text}
                                                        </span>
                                                        {isCorrect && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                                    </div>

                                                    {/* Right side: Bar and Percentage */}
                                                    <div className="flex items-center gap-4 w-1/2 sm:w-2/5">
                                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                                            <div
                                                                className="bg-purple-600 h-4 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-gray-800 w-12 text-right">{percentage}%</span>
                                                    </div>
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