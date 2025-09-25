'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Eye, Plus, Clock, Users } from 'lucide-react';
import Link from 'next/link';
// import Participants from '../../../components/Participants';
interface PollOption { id: number; text: string; isCorrect: boolean; }
interface PollResult { id: number; count: number; percentage: number; }
interface Student { id: string; name: string; }

export default function TeacherResultsPage() {
    const { socket } = useSocket();
    const [question, setQuestion] = useState<string | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [results, setResults] = useState<PollResult[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showNewQuestionButton, setShowNewQuestionButton] = useState(false);
    const [totalStudents, setTotalStudents] = useState(0);
    // const [participants, setParticipants] = useState<Student[]>([]);
    const [answersCount, setAnswersCount] = useState(0);

    useEffect(() => {
        if (socket) {
            const handleNewQuestion = (data: { question: string, options: PollOption[], timeLimit: number }) => {
                setQuestion(data.question); setOptions(data.options); setTimeLeft(data.timeLimit);
                setResults([]); setAnswersCount(0); setShowNewQuestionButton(false);
            };
            const handleResultsUpdate = (data: { results: PollResult[], answersCount: number }) => { setResults(data.results); setAnswersCount(data.answersCount); };
            const handleTimerTick = (data: { timeLeft: number }) => setTimeLeft(data.timeLeft);
            const handlePollOver = () => setShowNewQuestionButton(true);
            // const handleStudentListUpdate = (students: Student[]) => setParticipants(students); // Updated handler

            const handleStudentListUpdate = (students: Student[]) => setTotalStudents(students.length);
            socket.emit('get_initial_data');
            socket.on('initial_data', handleNewQuestion); socket.on('new_question', handleNewQuestion);
            socket.on('results_update', handleResultsUpdate); socket.on('timer_tick', handleTimerTick);
            socket.on('poll_over', handlePollOver); socket.on('student_list_update', handleStudentListUpdate);
            // socket.on('student_list_update', handleStudentListUpdate); 
            // Now handles the full list
            return () => {
                socket.off('initial_data', handleNewQuestion); socket.off('new_question', handleNewQuestion);
                socket.off('results_update', handleResultsUpdate); socket.off('timer_tick', handleTimerTick);
                socket.off('poll_over', handlePollOver); socket.off('student_list_update', handleStudentListUpdate);
            };
        }
    }, [socket]);
    // const handleKickStudent = (studentId: string) => {
    //     if (socket) {
    //         socket.emit('kick_student', studentId);
    //     }
    // };//

    const formatTime = (seconds: number) => {
        if (seconds < 0) seconds = 0;
        return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    if (!question) return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F2] font-sans text-center p-4">
             <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#7765DA]"></div>
             <h1 className="text-3xl font-bold text-[#373737] mt-8">Waiting for Poll to Start</h1>
             <p className="text-lg text-[#6E6E6E] mt-2">Go to the setup page to ask a question.</p>
             <Link href="/teacher/setup" className="mt-6 bg-[#7765DA] text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-[#5767D0] transition inline-flex items-center gap-2">
                <Plus size={24} /> Ask a Question
             </Link>
        </main>
    );

    return (
        <main className="flex flex-col items-center min-h-screen bg-[#F2F2F2] font-sans p-4 md:p-8">
            <div className="w-full max-w-4xl">
                <div className="w-full flex justify-between items-center mb-4 gap-4 flex-wrap">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-[#373737] bg-white px-4 py-2 rounded-lg shadow-md"><Clock size={20} /><span>{formatTime(timeLeft)}</span></div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-[#373737] bg-white px-4 py-2 rounded-lg shadow-md"><Users size={20} /><span>{answersCount} / {totalStudents} Answered</span></div>
                     </div>
                     <Link href="/teacher/history" className="bg-[#7765DA] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#5767D0] transition flex items-center gap-2"><Eye size={20} /> View Poll History</Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-[#373737] mb-6">Live Results</h2>
                    <div className="bg-[#373737] text-white p-6 rounded-lg mb-8 min-h-[80px]"><p className="text-xl font-semibold">{question}</p></div>
                    <div className="space-y-4">
                        {options.map((option) => {
                            const result = results.find(r => r.id === option.id);
                            const percentage = result ? result.percentage : 0;
                            return (
                                <div key={option.id} className="border rounded-lg p-4 text-lg relative overflow-hidden bg-gray-50">
                                    <div className="absolute top-0 left-0 h-full bg-[#7765DA] opacity-30 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <span className={`font-semibold ${option.isCorrect ? 'text-green-600' : 'text-gray-800'}`}>{option.text} {option.isCorrect && ' (Correct)'}</span>
                                        <span className="font-bold text-[#373737]">{percentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-8 text-center h-16">
                    {showNewQuestionButton && (
                         <Link href="/teacher/setup" className="bg-[#5767D0] text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-[#4F0DCE] transition inline-flex items-center gap-2 animate-pulse">
                             <Plus size={24} /> Ask Next Question
                         </Link>
                    )}
                </div>
            </div>
             {/* <Participants students={participants} isTeacher={true} onKick={handleKickStudent} />// */}
        </main>
    );
}