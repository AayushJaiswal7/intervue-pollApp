'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext'; // Corrected relative path
import { Eye, Plus, MessageSquare } from 'lucide-react';

// Define the data types for clarity
interface PollOption {
    id: number;
    text: string;
    isCorrect: boolean;
}
interface PollResults {
    id: number;
    percentage: number;
}

export default function TeacherResultsPage() {
    const { socket } = useSocket();
    const [question, setQuestion] = useState<string | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [results, setResults] = useState<PollResults[]>([]);
    const [showNewQuestionButton, setShowNewQuestionButton] = useState(false);

    useEffect(() => {
        if (socket) {
            const handlePollData = (data: any) => {
                setQuestion(data.question);
                setOptions(data.options);
                setResults([]); // Reset results for the new poll
                setShowNewQuestionButton(false); // Hide button when new poll starts
            };
            const handleResultsUpdate = (data: PollResults[]) => {
                setResults(data);
            };
            const handleAllAnswersIn = () => {
                setShowNewQuestionButton(true);
            };

            socket.on('poll_data_for_teacher', handlePollData);
            socket.on('results_update', handleResultsUpdate);
            socket.on('new_question', handlePollData); 
            socket.on('all_answers_in', handleAllAnswersIn);

            return () => {
                socket.off('poll_data_for_teacher', handlePollData);
                socket.off('results_update', handleResultsUpdate);
                socket.off('new_question', handlePollData);
                socket.off('all_answers_in', handleAllAnswersIn);
            };
        }
    }, [socket]);
    
    return (
        <main className="flex flex-col items-center min-h-screen bg-[#F2F2F2] font-sans p-8">
            <div className="w-full max-w-3xl">
                <div className="w-full flex justify-end mb-4">
                    {/* Using a standard <a> tag to avoid Next/Link compilation issues */}
                    <a href="/teacher/history" className="bg-[#7765DA] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#5767D0] transition flex items-center gap-2">
                        <Eye size={20} /> View Poll history
                    </a>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-[#373737] mb-6">Question</h2>
                    <div className="bg-[#373737] text-white p-6 rounded-lg mb-8 min-h-[80px]">
                        <p className="text-xl font-semibold">{question || "Loading question..."}</p>
                    </div>
                    
                    <div className="space-y-4">
                        {(options || []).map((option) => {
                            const result = results.find(r => r.id === option.id);
                            const percentage = result ? result.percentage : 0;
                            return (
                                <div key={option.id} className="border rounded-lg p-4 text-lg relative overflow-hidden bg-gray-50">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-[#7765DA] opacity-30 transition-all duration-500"
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

                <div className="mt-8 text-center h-16">
                    {showNewQuestionButton && (
                        <a href="/teacher/setup" className="bg-[#5767D0] text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-[#4F0DCE] transition inline-flex items-center gap-2">
                            <Plus size={24} /> Ask a new question
                        </a>
                    )}
                </div>
            </div>
            <button className="fixed bottom-8 right-8 bg-[#7765DA] text-white p-4 rounded-full shadow-lg hover:bg-[#5767D0] transition">
                <MessageSquare size={28} />
            </button>
        </main>
    );
}

