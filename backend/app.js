"use strict";
const express = require("express");
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

io.on("connection", (socket) => {
  console.log("Nowe połączenie:", socket.id);

  socket.on("join", ({ username, recipeId }) => {
    const room = `recipe_${recipeId}`;
    socket.join(room);
    socket.username = username;
    socket.room = room;

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

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.to(socket.room).emit("message", {
        user: "system",
        text: `${socket.username} opuścił czat.`,
      });
    }
    console.log(`Użytkownik ${socket.username} (${socket.id}) się rozłączył.`);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Połączono z bazą danych MongoDB Atlas"))
  .catch((err) => console.error("Błąd połączenia z bazą danych:", err));

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
httpServer.listen(3001, () => {
  console.log(`Serwer WebSocket działa na porcie ${PORT}`);
});
