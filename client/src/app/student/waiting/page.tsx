'use client';

// This is the page a student sees after entering their name.
export default function StudentWaitingPage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F2] font-sans text-center">
            
            <div className="inline-block bg-[#E8E5FB] text-[#7765DA] font-semibold px-4 py-1 rounded-full text-sm mb-8">
                ✨ Intervue Poll
            </div>

            {/* Simple CSS loading spinner */}
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-[#7765DA] rounded-full animate-spin mb-8"></div>
            
            <h1 className="text-3xl font-bold text-[#373737]">
                You're in!
            </h1>
            <p className="text-xl text-[#6E6E6E] mt-2">
                Wait for the teacher to ask a question...
            </p>

        </main>
    );
}
