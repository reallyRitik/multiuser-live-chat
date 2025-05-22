# Real-time Chat App with Admin Panel (Node.js + Socket.IO + MongoDB)

This is a real-time chat application built using **Node.js**, **Socket.IO**, **MongoDB**, and **Express**. It includes a simple front-end for users and an admin panel to manage conversations.

---

## 📁 Project Structure

You said:
project-root/
│

│   ├── model/
│   │   └── message.js
│   └── public/
│       ├── index.html
│       └── admin.html
│   └──package-lock.json 
│   └──package.json 
│   └──server.js



## Install dependencies:

npm install

🔌 Usage
Open http://localhost:3000/index.html in a browser (User view).

Open http://localhost:3000/admin.html in another browser tab or window (Admin view).

The chat is real-time using WebSockets (Socket.IO). The admin can reply to individual users, and messages are stored in MongoDB.

📦 Technologies Used
Node.js

Express

Socket.IO

MongoDB

Mongoose

