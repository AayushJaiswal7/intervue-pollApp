'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext'; // Corrected relative path again for build system
import { Plus, Trash2 } from 'lucide-react';

// Define the type for a single poll option
interface PollOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

export default function TeacherSetupPage() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<PollOption[]>([
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
    ]);
    const [nextId, setNextId] = useState(3);
    const [timeLimit, setTimeLimit] = useState(60);
    const { socket } = useSocket();

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, { id: nextId, text: '', isCorrect: false }]);
            setNextId(nextId + 1);
        }
    };

    const removeOption = (id: number) => {
        if (options.length > 2) {
            setOptions(options.filter(option => option.id !== id));
        }
    };

    const updateOptionText = (id: number, newText: string) => {
        setOptions(options.map(option =>
            option.id === id ? { ...option, text: newText } : option
        ));
    };

    const setCorrectAnswer = (id: number) => {
        setOptions(options.map(option =>
            ({ ...option, isCorrect: option.id === id })
        ));
    };
    
    const setAsIncorrect = (id: number) => {
        setOptions(options.map(option =>
            option.id === id ? { ...option, isCorrect: false } : option
        ));
    };

    // This function now ONLY emits the event to the server.
    const handleAskQuestion = () => {
        if (socket && question.trim() && options.every(opt => opt.text.trim())) {
            if (!options.some(opt => opt.isCorrect)) {
                alert("Please select one correct answer.");
                return;
            }
            socket.emit('create_poll', {
                question,
                options,
                timeLimit,
            });
        } else {
            alert("Please fill out the question and all option fields.");
        }
    };

    // This useEffect hook now reliably handles navigation AFTER the server confirms.
    useEffect(() => {
        if (socket) {
            const handlePollCreated = () => {
                // Once the server confirms the poll is made, navigate to the results page.
                window.location.href = `/teacher/results`;
            };

            // The server sends this event to confirm the poll data was received.
            socket.on('poll_data_for_teacher', handlePollCreated);

            // Clean up the listener when we leave the page.
            return () => {
                socket.off('poll_data_for_teacher', handlePollCreated);
            };
        }
    }, [socket]);

    return (
        <main className="flex justify-center items-start min-h-screen bg-[#F2F2F2] font-sans py-12 px-4">
            <div className="w-full max-w-3xl">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-10">
                         <div className="inline-block bg-[#E8E5FB] text-[#7765DA] font-semibold px-4 py-1 rounded-full text-sm mb-4">
                            ✨ Intervue Poll - Teacher
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#373737]">
                            Create a New Poll
                        </h1>
                        <p className="text-lg text-[#6E6E6E] mt-4 max-w-xl mx-auto">
                            Fill out the details below. The poll will start for students as soon as you click "Ask Question".
                        </p>
                    </div>
                     <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="question" className="text-lg font-semibold text-[#373737]">
                                    Enter your question
                                </label>
                                <select 
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#7765DA] focus:border-[#7765DA] transition"
                                >
                                    <option value={30}>30 seconds</option>
                                    <option value={60}>60 seconds</option>
                                    <option value={90}>90 seconds</option>
                                    <option value={120}>2 minutes</option>
                                </select>
                            </div>
                            <textarea
                                id="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-gray-800 focus:ring-2 focus:ring-[#7765DA] focus:border-[#7765DA] transition"
                                placeholder="e.g., Which planet is known as the Red Planet?"
                                rows={3}
                            />
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-lg font-semibold text-[#373737]">Edit Options</label>
                                <label className="text-lg font-semibold text-[#373737]">Is it Correct?</label>
                            </div>
                            <div className="space-y-4">
                                {options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[#373737] flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateOptionText(option.id, e.target.value)}
                                            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#7765DA] focus:border-[#7765DA] transition"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="correct-answer"
                                                    checked={option.isCorrect} 
                                                    onChange={() => setCorrectAnswer(option.id)} 
                                                    className="h-5 w-5 text-[#7765DA] focus:ring-[#C3B9F5]"
                                                />
                                                <span className="ml-2 text-gray-700">Yes</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name={`is-correct-option-${option.id}`}
                                                    checked={!option.isCorrect} 
                                                    onChange={() => setAsIncorrect(option.id)}
                                                    className="h-5 w-5 text-gray-600 focus:ring-gray-400"
                                                />
                                                <span className="ml-2 text-gray-700">No</span>
                                            </label>
                                        </div>
                                        {options.length > 2 && (
                                            <button onClick={() => removeOption(option.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {options.length < 5 && (
                                <button onClick={addOption} className="flex items-center gap-2 text-[#7765DA] font-semibold mt-4">
                                    <Plus size={20} /> Add More option
                                </button>
                            )}
                        </div>
                    </div>
                     <div className="mt-12 text-right">
                        <button
                             onClick={handleAskQuestion}
                             className="px-8 py-4 rounded-lg font-semibold text-white text-lg bg-[#7765DA] hover:bg-[#5767D0] shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#C3B9F5]"
                        >
                            Ask Question
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

