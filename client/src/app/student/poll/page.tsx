'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext'; // Using a path alias for robustness
import { Clock, MessageSquare } from 'lucide-react';

// Define the types for our data from the server
interface PollOption {
    id: number;
    text: string;
}

interface PollResults {
    id: number;
    percentage: number;
}

export default function StudentPollPage() {
    const { socket } = useSocket();
    const [question, setQuestion] = useState<string | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [results, setResults] = useState<PollResults[]>([]);
    
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        if (socket) {
            // Listen for a new question from the server
            const handleNewQuestion = (data: { question: string; options: PollOption[] }) => {
                setQuestion(data.question);
                setOptions(data.options);
                // Reset state for the new question
                setResults([]);
                setSelectedOption(null);
                setHasSubmitted(false);
            };

            // Listen for live result updates from the server
            const handleResultsUpdate = (data: PollResults[]) => {
                setResults(data);
            };

            socket.on('new_question', handleNewQuestion);
            socket.on('results_update', handleResultsUpdate);

            // Clean up listeners when the component is unmounted
            return () => {
                socket.off('new_question', handleNewQuestion);
                socket.off('results_update', handleResultsUpdate);
            };
        }
    }, [socket]);

    const handleSubmit = () => {
        if (socket && selectedOption !== null) {
            console.log("Submitting answer:", selectedOption);
            // Send the answer to the server
            socket.emit('submit_answer', { optionId: selectedOption });
            setHasSubmitted(true);
        }
    };

    // If no question has been sent by the teacher, show a waiting screen.
    if (!question) {
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

    // Once a question is received, show the poll interface.
    return (
        <main className="flex items-center justify-center min-h-screen bg-[#F2F2F2] font-sans">
            <div className="w-full max-w-2xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#373737]">Question</h2>
                        <div className="flex items-center gap-2 text-[#6E6E6E]">
                            <Clock size={20} />
                            <span className="font-semibold text-lg">00:15</span> {/* Timer is static for now */}
                        </div>
                    </div>

                    <div className="bg-[#373737] text-white p-6 rounded-lg mb-8">
                        <p className="text-xl font-semibold">{question}</p>
                    </div>

                    <div className="space-y-4">
                        {options.map((option) => {
                            const result = results.find(r => r.id === option.id);
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => !hasSubmitted && setSelectedOption(option.id)}
                                    className={`
                                        border rounded-lg p-4 flex items-center justify-between text-lg
                                        transition-all duration-300 relative overflow-hidden
                                        ${!hasSubmitted ? 'cursor-pointer hover:border-[#7765DA] hover:bg-[#F2F2F2]' : ''}
                                        ${selectedOption === option.id && !hasSubmitted ? 'border-2 border-[#7765DA] bg-[#E8E5FB]' : 'border-gray-300'}
                                    `}
                                >
                                    {/* Result bar (updates live) */}
                                    {result && (
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-[#7765DA] opacity-30 transition-all duration-500"
                                            style={{ width: `${result.percentage}%` }}
                                        ></div>
                                    )}

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0
                                            ${selectedOption === option.id && !hasSubmitted ? 'bg-[#7765DA] text-white' : 'bg-gray-200 text-[#373737]'}
                                        `}>
                                            {option.id}
                                        </div>
                                        <span className="font-semibold text-gray-800">{option.text}</span>
                                    </div>

                                    {/* Percentage (updates live) */}
                                    {result && (
                                        <span className="font-bold text-[#373737] relative z-10">{result.percentage}%</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!hasSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            className={`
                                w-full mt-8 py-4 rounded-lg font-semibold text-white text-lg
                                ${selectedOption !== null ? 'bg-[#7765DA] hover:bg-[#5767D0]' : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            Submit
                        </button>
                    ) : (
                        <p className="text-center text-lg text-[#6E6E6E] mt-8 font-semibold">
                            Thank you for your answer! Results are live.
                        </p>
                    )}
                </div>
            </div>
             <button className="fixed bottom-8 right-8 bg-[#7765DA] text-white p-4 rounded-full shadow-lg hover:bg-[#5767D0] transition">
                <MessageSquare size={28} />
            </button>
        </main>
    );
}

