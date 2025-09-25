# Intervue Live Poll App 📊

A real-time, interactive polling application built with Next.js and Node.js. This platform allows a teacher to conduct live polls in a virtual classroom, with students participating and viewing results instantly.



## ✨ Features

* **👨‍🏫 Teacher Flow:**
    * Create polls with custom questions, multiple-choice options, and a countdown timer.
    * View a live results dashboard with percentages that update in real-time as students vote.
    * See a list of connected participants and have the ability to remove them from the session.
    * Review a complete history of all polls conducted during the session.
* **🧑‍🎓 Student Flow:**
    * Join a poll session by entering a name.
    * Receive questions in real-time.
    * Vote on polls and see a confirmation of their submitted answer.
    * View the final results, including the correct answer and class-wide percentages.
    * View a list of other participants in the session.
* **⚡ Real-time Communication:** Built with WebSockets for instant, bi-directional communication between the teacher and students.

---
## 🛠️ Tech Stack

* **Frontend:**
    * [Next.js](https://nextjs.org/) (React Framework)
    * [TypeScript](https://www.typescriptlang.org/)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [Socket.IO Client](https://socket.io/docs/v4/client-api/)
    * [Lucide React](https://lucide.dev/) (Icons)
* **Backend:**
    * [Node.js](https://nodejs.org/)
    * [Express](https://expressjs.com/)
    * [Socket.IO](https://socket.io/)

---
## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
* [Node.js](https://nodejs.org/en/download/) (which includes npm)

### Installation & Running Locally

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/AyushJaiswal7/intervue-poll-app.git
    cd intervue-poll-app
    ```

2.  **Start the Backend Server:**
    * Navigate to the server directory, install dependencies, and start the server.
    ```sh
    cd server
    npm install
    npm start
    ```
    * Your backend will be running on `http://localhost:8080`.

3.  **Start the Frontend Application:**
    * Open a **new terminal window**.
    * Navigate to the client directory, install dependencies, and start the development server.
    ```sh
    cd client
    npm install
    npm run dev
    ```
    * Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---
## ☁️ Deployment

This project is structured as a monorepo and requires a two-part deployment:

1.  **Backend (Server):** The Node.js WebSocket server needs to be deployed to a service that supports long-running applications, such as **Render** or **Heroku**.
    * **Root Directory:** `server`
    * **Start Command:** `node index.js`

2.  **Frontend (Client):** The Next.js application is deployed to **Vercel**.
    * **Framework Preset:** `Next.js`
    * **Root Directory:** `client`

**Important:** Before deploying, you must update the URLs in `client/context/SocketContext.tsx` and `server/index.js` to point to your live backend URL.

## 🚀 Live Demo

[**View the live application here!**](https://intervue-poll-appdam.vercel.app/)

