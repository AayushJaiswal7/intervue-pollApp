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

// A single, global object to hold the current poll state
let currentPoll = null;

const resetPoll = () => {
    currentPoll = {
        question: null,
        options: [],
        participants: [],
        answers: {},
        teacherSocketId: null
    };
};

// Initialize the poll state
resetPoll();

io.on('connection', (socket) => {
  console.log(`✅ A user connected: ${socket.id}`);

  // When a teacher creates a poll, it becomes the new global poll
  socket.on('create_poll', (data) => {
    currentPoll = {
        question: data.question,
        options: data.options,
        participants: [],
        answers: {},
        teacherSocketId: socket.id
    };
    console.log(`🎉 New poll created by teacher.`);
    // Let the teacher know it was created successfully
    socket.emit('poll_created'); 
  });

  // When a student joins, they join the single global poll
  socket.on('join_poll', (data) => {
    const { name } = data;
    if (currentPoll) {
        currentPoll.participants.push({ id: socket.id, name });
        console.log(`🧑‍🎓 Student ${name} joined the poll`);
        // Broadcast the updated participant list to everyone
        io.emit('update_participants', currentPoll.participants);
        socket.emit('join_success');
    } else {
        socket.emit('error', { message: "No active poll found." });
    }
  });

  // (The 'start_poll' and 'submit_answer' logic will work similarly, broadcasting to all)

  socket.on('disconnect', () => {
    console.log(`❌ A user disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

