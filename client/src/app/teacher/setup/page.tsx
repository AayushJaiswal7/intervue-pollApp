'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown } from 'lucide-react';

interface PollOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

export default function TeacherSetupPage() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<PollOption[]>([
        { id: 1, text: '', isCorrect: true },
        { id: 2, text: '', isCorrect: false },
    ]);
    const [nextId, setNextId] = useState(3);
    const [timeLimit, setTimeLimit] = useState(60);
    const { socket } = useSocket();
    const router = useRouter();

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, { id: nextId, text: '', isCorrect: false }]);
            setNextId(nextId + 1);
        }
    };

    

    const updateOptionText = (id: number, newText: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text: newText } : opt));
    };

    const setCorrectAnswer = (id: number) => {
        setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    };

    const handleAskQuestion = () => {
        if (socket && question.trim() && options.every(opt => opt.text.trim())) {
            if (!options.some(opt => opt.isCorrect)) {
                alert("Please select one correct answer.");
                return;
            }
            socket.emit('create_poll', { question, options, timeLimit });
        } else {
            alert("Please fill out the question and all option fields.");
        }
    };

    useEffect(() => {
        if (socket) {
            const handlePollCreated = () => router.push(`/teacher/results`);
            socket.on('poll_created', handlePollCreated);
            return () => { socket.off('poll_created', handlePollCreated); };
        }
    }, [socket, router]);

    return (
        <main className="flex justify-center min-h-screen bg-gray-100 font-sans p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="inline-flex items-center bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-sm mb-4">
                            <svg className="w-2 h-2 mr-2 text-purple-500 fill-current" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                            Intervue Poll
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800">
                             Lets Get Started
                        </h1>
                        <p className="text-lg text-gray-500 mt-2">
                            You  have the ability to create and manage polls, ask questions, and monitor your student responses in real-time.
                        </p>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="question" className="text-lg font-semibold text-gray-700">
                                    Enter your question
                                </label>
                                <div className="relative">
                                    <select
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                                        className="appearance-none bg-white py-2 pl-3 pr-8 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                    >
                                        <option value={30}>30 seconds</option>
                                        <option value={60}>60 seconds</option>
                                        <option value={90}>90 seconds</option>
                                        <option value={120}>2 minutes</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-800 focus:ring-2 focus:ring-purple-500 resize-none bg-gray-50"
                                    placeholder="Type your question here..."
                                    rows={4}
                                    maxLength={100}
                                />
                                <span className="absolute bottom-3 right-3 text-sm text-gray-400">{question.length}/100</span>
                            </div>
                        </div>

                        {/* Options Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-lg font-semibold text-gray-700">Edit Options</label>
                                <label className="text-lg font-semibold text-gray-700">Is it Correct?</label>
                            </div>
                            <div className="space-y-4">
                                {options.map((option) => (
                                    <div key={option.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                            {options.indexOf(option) + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateOptionText(option.id, e.target.value)}
                                            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500"
                                            placeholder={`Option ${options.indexOf(option) + 1}`}
                                        />
                                        <div className="flex items-center gap-4 w-28 justify-end">
                                             {/* A single radio button is better for selecting one correct answer */}
                                            <input type="radio" name="correct-answer" checked={option.isCorrect} onChange={() => setCorrectAnswer(option.id)} className="h-6 w-6 text-purple-600 focus:ring-purple-500"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {options.length < 5 && (
                                <button onClick={addOption} className="flex items-center gap-2 text-purple-600 font-semibold mt-4 hover:text-purple-800 transition-colors">
                                    <Plus size={20} /> Add More option
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto bg-white border-t border-gray-200 p-6 rounded-b-xl">
                    <div className="flex justify-end">
                        <button
                            onClick={handleAskQuestion}
                            className="px-8 py-3 rounded-lg font-semibold text-white text-lg bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
                        >
                            Ask Question
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}