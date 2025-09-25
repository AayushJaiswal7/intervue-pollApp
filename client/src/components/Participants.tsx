'use client';

import { useState } from 'react';
import { Users, X } from 'lucide-react';

interface Student {
    id: string;
    name: string;
}

interface ParticipantsProps {
    students: Student[];
    isTeacher: boolean;
    onKick: (studentId: string) => void;
}

export default function Participants({ students, isTeacher, onKick }: ParticipantsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleKick = (studentId: string, studentName: string) => {
        if (window.confirm(`Are you sure you want to kick out ${studentName}?`)) {
            onKick(studentId);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110"
            >
                <Users size={28} />
            </button>

            {/* Overlay */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            ></div>

            {/* Side Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                           {/* In a full implementation, you'd have logic here to switch between Chat and Participants */}
                           <h2 className="text-xl font-bold text-purple-600 border-b-2 border-purple-600 pb-1">Participants ({students.length})</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>

                    {/* Participant List */}
                    <div className="flex-grow overflow-y-auto p-4">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 mb-4 px-2">
                            <span>NAME</span>
                            {isTeacher && <span>ACTION</span>}
                        </div>
                        <ul className="space-y-2">
                            {students.map((student) => (
                                <li key={student.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100">
                                    <span className="font-semibold text-gray-800">{student.name}</span>
                                    {isTeacher && (
                                        <button
                                            onClick={() => handleKick(student.id, student.name)}
                                            className="text-blue-500 hover:text-blue-700 font-semibold"
                                        >
                                            Kick out
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}