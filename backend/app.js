"use strict";
const express = require("express");
const { logMessage } = require("./utils/sshLogger");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const roomUsers = {};

io.on("connection", (socket) => {
  console.log("Nowe połączenie:", socket.id);

  socket.on("join", ({ username, recipeId }) => {
    const room = `recipe_${recipeId}`;
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!roomUsers[room]) roomUsers[room] = 0;
    roomUsers[room]++;

    io.to(room).emit("userCount", { count: roomUsers[room] });

    socket.to(room).emit("message", {
      user: "system",
      text: `${username} dołączył do czatu.`,
    });
    console.log(`${username} dołączył do pokoju: ${room}`);
  });

  socket.on("sendMessage", (message) => {
    if (socket.room) {
      io.to(socket.room).emit("message", {
        user: socket.username,
        text: message,
      });
    }
  });

  // powiadomienia
  socket.on("newComment", (comment) => {
    io.to(`recipe_${comment.recipe_id}`).emit("notification", {
      type: "comment",
      message: `Nowy komentarz od ${comment.username}: "${comment.text}"`,
    });
  });

  socket.on("newRating", (rating) => {
    io.to(`recipe_${rating.recipe_id}`).emit("notification", {
      type: "rating",
      message: `${rating.username} ocenił przepis na ${rating.rating} gwiazdek!`,
    });
  });

  socket.on("newMessage", (message) => {
    io.to(`recipe_${message.recipe_id}`).emit("notification", {
      type: "message",
      message: `Nowa wiadomość od ${message.username}`,
    });
  });

  // prywatny czat
  socket.on("joinPrivateChat", ({ userId, recipientId }) => {
    const room = [userId, recipientId].sort().join("_");
    socket.join(room);
    socket.room = room;
    socket.username = userId;
    console.log(`Użytkownik ${userId} dołączył do pokoju: ${room}`);
  });

  socket.on("sendPrivateMessage", ({ senderId, recipientId, message }) => {
    const room = [senderId, recipientId].sort().join("_");
    io.to(room).emit("privateMessage", {
      senderId,
      message,
      timestamp: new Date().toISOString(),
    });
    console.log(`Nowa wiadomość od ${senderId} do ${recipientId}: ${message}`);
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      roomUsers[socket.room] = Math.max((roomUsers[socket.room] || 1) - 1, 0);
      io.to(socket.room).emit("userCount", { count: roomUsers[socket.room] });

      socket.to(socket.room).emit("message", {
        user: "system",
        text: `${socket.username} opuścił czat.`,
      });

      console.log(
        `${socket.username} opuścił pokój: ${socket.room}. Użytkownicy: ${
          roomUsers[socket.room]
        }`
      );
    }
    if (socket.privateRoom) {
      console.log(`Użytkownik ${socket.id} rozłączony`);
      socket.leave(socket.privateRoom);
    }
  });
});

app.get("/", (req, res) => {
  logMessage("Użytkownik odwiedził stronę główną.");
  res.send("Witaj w aplikacji!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Połączono z bazą danych MongoDB Atlas"))
  .catch((err) => console.error("Błąd połączenia z bazą danych:", err));

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  logMessage("Serwer uruchomiony na porcie " + PORT);
});
httpServer.listen(3001, () => {
  console.log(`Serwer WebSocket działa na porcie 3001`);
});
