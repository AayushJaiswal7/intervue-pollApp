'use client';

import { useState, ReactNode } from 'react';
import { User, School } from 'lucide-react';

// Define the types for the RoleCard component's props to fix TypeScript errors.
interface RoleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  role: 'student' | 'teacher';
  isSelected: boolean;
  onSelect: (role: 'student' | 'teacher') => void;
}

export default function WelcomePage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>('student');

  const handleContinue = () => {
    if (selectedRole === 'teacher') {
      window.location.href = '/teacher/setup';
    } else if (selectedRole === 'student') {
      window.location.href = '/student/setup';
    }
  };

  const RoleCard = ({ icon, title, description, role, isSelected, onSelect }: RoleCardProps) => {
    return (
      <div
        onClick={() => onSelect(role)}
        className={`
          border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300
          flex flex-col items-center gap-4
          ${isSelected ? 'border-[#7765DA] bg-[#F2F2F2] shadow-lg' : 'border-gray-300 bg-white hover:border-[#7765DA] hover:shadow-md'}
        `}
      >
        <div className={`
          rounded-full p-3 transition-colors duration-300
          ${isSelected ? 'bg-[#7765DA] text-white' : 'bg-[#F2F2F2] text-[#373737]'}
        `}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-[#373737]">{title}</h3>
        <p className="text-sm text-[#6E6E6E]">{description}</p>
      </div>
    );
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#F2F2F2] font-sans">
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#E8E5FB] text-[#7765DA] font-semibold px-4 py-1 rounded-full text-sm mb-4">
            ✨ Intervue Poll
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#373737]">
            Welcome to the Live Polling System
          </h1>
          <p className="text-lg text-[#6E6E6E] mt-4 max-w-xl mx-auto">
            Please select the role that best describes you to begin using the live polling system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <RoleCard
            icon={<User size={28} />}
            title="I'm a Student"
            description="Submit answers and view live poll results in real-time with your classmates."
            role="student"
            isSelected={selectedRole === 'student'}
            onSelect={setSelectedRole}
          />
          <RoleCard
            icon={<School size={28} />}
            title="I'm a Teacher"
            description="Create and manage polls, ask questions, and monitor your students' responses."
            role="teacher"
            isSelected={selectedRole === 'teacher'}
            onSelect={setSelectedRole}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`
              w-full max-w-xs mx-auto px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-[#C3B9F5]
              ${selectedRole ? 'bg-[#7765DA] hover:bg-[#5767D0] shadow-md hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}

