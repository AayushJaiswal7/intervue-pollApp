const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 8080;

// --- State Management ---
let currentPoll = null;
let pollTimer = null;
let pollHistory = []; // To store completed polls for the history page

/**
 * Resets the current poll state to its initial values.
 */
const resetPollState = () => {
    if (pollTimer) clearInterval(pollTimer);
    currentPoll = {
        question: null,
        options: [], // { id, text, isCorrect }
        participants: [], // { id, name }
        answers: {}, // { socketId: optionId }
        teacherSocketId: null,
        timeLimit: 60,
    };
    pollTimer = null;
};

// Initialize the state when the server starts
resetPollState();

/**
 * Calculates the current results of the poll based on submitted answers.
 * @returns {Array<{id: number, count: number, percentage: number}>} An array of result objects.
 */
const calculateResults = () => {
    if (!currentPoll || !currentPoll.question) return [];
    
    const answerCounts = {};
    currentPoll.options.forEach(opt => { answerCounts[opt.id] = 0; });
    
    Object.values(currentPoll.answers).forEach(optionId => {
        if (answerCounts[optionId] !== undefined) {
            answerCounts[optionId]++;
        }
    });

    const totalAnswers = Object.keys(currentPoll.answers).length;
    if (totalAnswers === 0) {
        return currentPoll.options.map(opt => ({ id: opt.id, count: 0, percentage: 0 }));
    }

    return currentPoll.options.map(opt => ({
        id: opt.id,
        count: answerCounts[opt.id],
        percentage: Math.round((answerCounts[opt.id] / totalAnswers) * 100)
    }));
};

/**
 * Ends the current poll, sends final results, and archives it.
 */
const endPoll = () => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    
    console.log('⌛ Poll has ended.');
    
    const finalResults = calculateResults();
    const correctAnswerId = currentPoll.options.find(opt => opt.isCorrect)?.id;

    // Send final results to all students
    io.emit('final_results', {
        results: finalResults,
        correctAnswerId: correctAnswerId
    });

    // Notify teacher the poll is over so they can show the "Ask Next" button
    if (currentPoll.teacherSocketId) {
        io.to(currentPoll.teacherSocketId).emit('poll_over');
    }

    // Archive the poll for the history page
    pollHistory.push({
        question: currentPoll.question,
        options: currentPoll.options,
        results: finalResults,
        correctAnswerId: correctAnswerId
    });

    // A small delay before reset allows final events to be sent
    setTimeout(() => {
        resetPollState();
    }, 1000);
};

// --- Socket Connection Logic ---
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // TEACHER EVENTS
  socket.on('create_poll', (data) => {
    console.log(`🚀 Poll created by ${socket.id}:`, data.question);
    
    resetPollState(); // Reset previous poll state
    currentPoll.question = data.question;
    currentPoll.options = data.options;
    currentPoll.timeLimit = data.timeLimit;
    currentPoll.teacherSocketId = socket.id;

    // Data for students (without the correct answer)
    const pollDataForStudents = {
        question: data.question,
        options: data.options.map(({ id, text }) => ({ id, text })),
        timeLimit: data.timeLimit
    };

    // Notify the teacher's setup page to navigate to results
    socket.emit('poll_created');

    // Send the question to all connected clients (students)
    io.emit('new_question', pollDataForStudents);

    // Start the timer
    let timeLeft = currentPoll.timeLimit;
    pollTimer = setInterval(() => {
        timeLeft--;
        io.emit('timer_tick', { timeLeft });
        if (timeLeft <= 0) {
            endPoll();
        }
    }, 1000);
  });

  socket.on('get_history', () => {
    socket.emit('poll_history', pollHistory);
  });

  socket.on('get_initial_data', () => {
      if(currentPoll && currentPoll.question && socket.id === currentPoll.teacherSocketId) {
          socket.emit('initial_data', {
            question: currentPoll.question,
            options: currentPoll.options,
            timeLimit: currentPoll.timeLimit
          });
          io.to(currentPoll.teacherSocketId).emit('student_list_update', currentPoll.participants);
      }
  });


  // STUDENT EVENTS
  socket.on('join_poll', (data) => {
    const studentName = data.name.trim();
    if (studentName) {
        currentPoll.participants.push({ id: socket.id, name: studentName });
        console.log(`🙋‍♂️ ${studentName} joined the poll.`);
        socket.emit('join_success');
        
        // Update teacher's view with the new student count
        if (currentPoll.teacherSocketId) {
            io.to(currentPoll.teacherSocketId).emit('student_list_update', currentPoll.participants);
        }
    } else {
        socket.emit('error', { message: "Name cannot be empty." });
    }
  });

  socket.on('submit_answer', (data) => {
    // Check if poll is active and student hasn't answered yet
    if (currentPoll.question && !currentPoll.answers[socket.id]) {
        currentPoll.answers[socket.id] = data.optionId;
        const totalAnswers = Object.keys(currentPoll.answers).length;

        // Send live results update ONLY to the teacher
        if (currentPoll.teacherSocketId) {
            io.to(currentPoll.teacherSocketId).emit('results_update', {
                results: calculateResults(),
                answersCount: totalAnswers
            });
        }
        
        // If all participants have answered, end the poll early
        if (currentPoll.participants.length > 0 && totalAnswers >= currentPoll.participants.length) {
            console.log('🏁 All participants have answered. Ending poll early.');
            endPoll();
        }
    }
  });
   socket.on('kick_student', (studentId) => {
    // Only the teacher can kick students
    if (socket.id === currentPoll.teacherSocketId) {
      const studentSocket = io.sockets.sockets.get(studentId);
      if (studentSocket) {
        // 1. Tell the student they were kicked
        studentSocket.emit('you_were_kicked');
        // 2. Forcibly disconnect them
        studentSocket.disconnect(true);
      }
      // 3. Update the participants list (this will be handled by the 'disconnect' event)
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    // Remove participant from the list if they were in one
    const index = currentPoll.participants.findIndex(p => p.id === socket.id);
    if (index !== -1) {
        console.log(`👋 ${currentPoll.participants[index].name} left.`);
        currentPoll.participants.splice(index, 1);
        
        // Update teacher on student count change
        if (currentPoll.teacherSocketId) {
            io.to(currentPoll.teacherSocketId).emit('student_list_update', currentPoll.participants);
            // Also update the live results as the total number of expected answers has changed
            io.to(currentPoll.teacherSocketId).emit('results_update', {
                results: calculateResults(),
                answersCount: Object.keys(currentPoll.answers).length
            });
        }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});