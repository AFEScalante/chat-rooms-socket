import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import "dotenv/config";

const app = express();
const server = createServer(app, {
  cors: {
    origin: "*",
  },
});
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.SERVER_PORT ?? 3000;

app.get("/", (req, res) => {
  res.send("<h1>Servidor corriendo</h1>");
});

io.on("connection", (socket) => {
  console.log(`El cliente ${socket.id} se ha conectado.`);

  socket.on("join-room", (room) => {
    socket.emit("room-joined");
    socket.join(room);
  });

  socket.on("leave-room", (room) => {
    socket.emit("room-leave");
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log(`El cliente ${socket.id} se desconectó`);
  });

  socket.on("message", ({ roomId, user, message }) => {
    console.log(`Mensaje del cliente ${socket.id} recibido: ${message}`);
    socket.to(roomId).emit("message", { user, message });
  });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
