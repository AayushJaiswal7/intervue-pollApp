'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import Participants from '../../../components/Participants';//
import { useRouter } from 'next/navigation';//
interface PollOption { id: number; text: string; }
interface FinalResults { id: number; percentage: number; }
interface Student { id: string; name: string; }//

export default function StudentPollPage() {
    const { socket } = useSocket();
    const router = useRouter();//
    const [question, setQuestion] = useState<string | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [finalResults, setFinalResults] = useState<FinalResults[]>([]);
    const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
    const [participants, setParticipants] = useState<Student[]>([]);//
    useEffect(() => {
        if (socket) {
            const handleNewQuestion = (data: { question: string; options: PollOption[], timeLimit: number }) => {
                setQuestion(data.question); setOptions(data.options); setTimeLeft(data.timeLimit);
                setSelectedOption(null); setHasSubmitted(false); setFinalResults([]); setCorrectAnswerId(null);
            };
            const handleTimerTick = (data: { timeLeft: number }) => setTimeLeft(data.timeLeft);
            const handleFinalResults = (data: { results: FinalResults[], correctAnswerId: number }) => {
                setFinalResults(data.results); setCorrectAnswerId(data.correctAnswerId); setHasSubmitted(true);
            };
              const handleKicked = () => {
                alert("You have been removed from the poll by the teacher.");
                router.push('/');
            };
            socket.on('new_question', handleNewQuestion); 
            socket.on('timer_tick', handleTimerTick);
            socket.on('final_results', handleFinalResults);
            socket.on('you_were_kicked', handleKicked); 
            return () => { socket.off('new_question', handleNewQuestion); socket.off('timer_tick', handleTimerTick); 
            socket.off('final_results', handleFinalResults);
            socket.off('you_were_kicked', handleKicked); };

            
        }
    }, [socket, router]);

    const handleSubmit = () => { if (socket && selectedOption !== null) { socket.emit('submit_answer', { optionId: selectedOption }); setHasSubmitted(true); } };
    const formatTime = (seconds: number) => {
        if (seconds < 0) seconds = 0;
        return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

   if (!question) return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
            <div className="text-center">
                <div className="inline-flex items-center bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-sm mb-4">
                    <svg className="w-2 h-2 mr-2 text-purple-500 fill-current" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                    Intervue Poll
                </div>
                <div className="w-16 h-16 border-4 border-solid border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <p className="text-xl text-gray-700 mt-2 font-semibold">Wait for the teacher to ask questions..</p>
            </div>
        </main>
    );

    const isPollOver = finalResults.length > 0;
    const wasAnswerCorrect = selectedOption === correctAnswerId;

    return (
    // <>
        <main className="flex items-center justify-center min-h-screen bg-[#F2F2F2] font-sans">
            <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#373737]">Question</h2>
                        <div className="flex items-center gap-2 text-[#6E6E6E]"><Clock size={20} /><span className="font-semibold text-lg">{formatTime(timeLeft)}</span></div>
                    </div>
                    <div className="bg-[#373737] text-white p-6 rounded-lg mb-8"><p className="text-xl font-semibold">{question}</p></div>
                    <div className="space-y-4">
                        {options.map((option, index) => {
                            const result = finalResults.find(r => r.id === option.id);
                            const isSelected = selectedOption === option.id;
                            const isCorrect = correctAnswerId === option.id;
                            let optionClass = 'border-gray-300';
                            if (isPollOver) {
                                if (isCorrect) optionClass = 'border-2 border-green-500 bg-green-50';
                                if (isSelected && !isCorrect) optionClass = 'border-2 border-red-500 bg-red-50';
                            } else if (isSelected) optionClass = 'border-2 border-[#7765DA] bg-[#E8E5FB]';
                            return (
                                <div key={option.id} onClick={() => !hasSubmitted && timeLeft > 0 && setSelectedOption(option.id)}
                                    className={`border rounded-lg p-4 flex items-center justify-between text-lg transition-all duration-300 relative overflow-hidden ${!hasSubmitted && timeLeft > 0 ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'} ${optionClass}`}>
                                    {isPollOver && result && <div className="absolute top-0 left-0 h-full bg-[#7765DA] opacity-20" style={{ width: `${result.percentage}%` }}></div>}
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isSelected && !isPollOver ? 'bg-[#7765DA] text-white' : 'bg-gray-200 text-[#373737]'}`}>{String.fromCharCode(65 + index)}</div>
                                        <span className="font-semibold text-gray-800">{option.text}</span>
                                    </div>
                                    {isPollOver && result && <span className="font-bold text-[#373737] relative z-10">{result.percentage}%</span>}
                                </div>
                            );
                        })}
                    </div>
                    {!hasSubmitted && timeLeft > 0 ? (
                        <button onClick={handleSubmit} disabled={selectedOption === null} className={`w-full mt-8 py-4 rounded-lg font-semibold text-white text-lg ${selectedOption !== null ? 'bg-[#7765DA] hover:bg-[#5767D0]' : 'bg-gray-400 cursor-not-allowed'}`}>Submit</button>
                    ) : (
                        <div className="text-center text-lg mt-8 font-semibold h-12 flex items-center justify-center">
                            {isPollOver ? (wasAnswerCorrect ? <span className="flex items-center gap-2 text-green-600"><CheckCircle /> Correct!</span> : <span className="flex items-center gap-2 text-red-600"><XCircle /> Better luck next time.</span>)
                                : (<span className="text-[#6E6E6E]">Your answer is submitted. Waiting for results...</span>)}
                        </div>
                    )}
                </div>
                 {isPollOver && (
                <div className="text-center mt-6">
                    <p className="text-lg text-gray-600 animate-pulse">
                        Waiting for the teacher to ask the next question...
                    </p>
                </div>
            )}
            </div>
        </main>
        
    );
}