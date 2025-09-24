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

let currentPoll = null;
let pollHistory = [];

const resetPollState = () => {
    currentPoll = {
        question: null,
        options: [],
        participants: [],
        answers: {},
        teacherSocketId: null,
        participantCountAtStart: 0,
    };
};

resetPollState();

io.on('connection', (socket) => {
  console.log(`✅ A user connected: ${socket.id}`);

  socket.on('create_poll', (data) => {
    if (currentPoll && currentPoll.question) {
        pollHistory.push({ ...currentPoll, results: calculateResults() });
    }

    currentPoll = {
        question: data.question,
        options: data.options,
        participants: currentPoll ? currentPoll.participants : [],
        answers: {},
        teacherSocketId: socket.id,
        participantCountAtStart: currentPoll ? currentPoll.participants.length : 0,
    };
    
    console.log(`🎉 New poll created and started for ${currentPoll.participantCountAtStart} participants.`);
    
    const pollDataForClients = {
        question: currentPoll.question,
        options: currentPoll.options.map(opt => ({ id: opt.id, text: opt.text }))
    };

    // This is the crucial broadcast that tells all clients a new question is ready
    io.emit('new_question', pollDataForClients);
    // This sends the full data (including correct answers) only to the teacher
    socket.emit('poll_data_for_teacher', currentPoll);
  });

  socket.on('join_poll', (data) => {
    const { name } = data;
    if (currentPoll) {
        currentPoll.participants.push({ id: socket.id, name });
        io.emit('update_participants', currentPoll.participants);
        socket.emit('join_success');

        // If a poll is already active when a student joins, send them the current question
        if (currentPoll.question) {
            socket.emit('new_question', {
                question: currentPoll.question,
                options: currentPoll.options.map(opt => ({ id: opt.id, text: opt.text }))
            });
        }
    } else {
        socket.emit('error', { message: "No active poll found." });
    }
  });

  const calculateResults = () => {
    const results = {};
    const totalAnswers = Object.keys(currentPoll.answers).length;
    if (totalAnswers === 0) {
        return currentPoll.options.map(opt => ({ id: opt.id, percentage: 0 }));
    }
    
    currentPoll.options.forEach(opt => { results[opt.id] = 0; });
    Object.values(currentPoll.answers).forEach(ansId => { results[ansId]++; });

    return Object.keys(results).map(id => ({
        id: parseInt(id),
        percentage: Math.round((results[id] / totalAnswers) * 100)
    }));
  };

  socket.on('submit_answer', (data) => {
    if (currentPoll && !currentPoll.answers[socket.id]) {
        currentPoll.answers[socket.id] = data.optionId;
        io.emit('results_update', calculateResults());

        const totalAnswers = Object.keys(currentPoll.answers).length;
        const totalParticipants = currentPoll.participantCountAtStart;

        // Note: This logic assumes all originally present students will answer.
        if (totalAnswers > 0 && totalAnswers >= totalParticipants) {
            console.log('All participants have answered!');
            // Send to the specific teacher who created the poll
            io.to(currentPoll.teacherSocketId).emit('all_answers_in');
        }
    }
  });
  
  socket.on('get_history', () => {
    socket.emit('poll_history', pollHistory);
  });

  socket.on('disconnect', () => {
    console.log(`❌ A user disconnected: ${socket.id}`);
    // Future logic could remove user from participants list and re-check if all answers are in
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});