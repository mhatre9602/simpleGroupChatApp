//Node Server handling socket io connections
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { createServer } from "http";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const users = {};

// When a new socket connection is established
io.on("connection", (socket) => {
  // When a new user joins
  socket.on("new-user-joined", (name) => {
    console.log("New User", name);

    // Store the user's name with their socket ID
    users[socket.id] = name;
    // Notify all other users that a new user has joined
    socket.broadcast.emit("user-joined", name);
  });

  // When a user sends a message
  socket.on("send", (message) => {
    // Broadcast the message to all other users, including the sender's name
    socket.broadcast.emit("recieve", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
});

app.set("port", process.env.PORT || 8000);

httpServer.listen(app.get("port"), function () {
  // Accessing server's address and port
  var port = httpServer.address().port;
  // Logging server's running port
  console.log("Running on : ", port);
});
