require("dotenv").config();
const connectDB = require("./config/db");
const Event = require("./models/Event");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// connect DB
connectDB();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =========================
  // CREATE EVENT
  // =========================
  socket.on("createEvent", async ({ username }) => {
    try {
      if (!username) {
        socket.emit("errorMessage", "Username required");
        return;
      }

      const eventId = Date.now().toString();

      const event = new Event({
        eventId,
        users: [
          {
            id: socket.id,
            name: username,
          },
        ],
      });

      await event.save();

      socket.join(eventId);

      socket.emit("eventCreated", {
        eventId,
        users: event.users,
      });

      console.log("Event created:", eventId);
    } catch (err) {
      console.error(err);
      socket.emit("errorMessage", "Server error");
    }
  });

  // =========================
  // JOIN EVENT
  // =========================
  socket.on("joinEvent", async ({ eventId, username }) => {
    try {
      const cleanEventId = String(eventId).trim();

      const event = await Event.findOne({ eventId: cleanEventId });

      if (!event) {
        socket.emit("errorMessage", "Event not found");
        return;
      }

      if (!username) {
        socket.emit("errorMessage", "Username required");
        return;
      }

      const alreadyJoined = event.users.find(
        (u) => u.id === socket.id
      );

      if (!alreadyJoined) {
        event.users.push({
          id: socket.id,
          name: username,
        });
      }

      await event.save();

      socket.join(cleanEventId);

      io.to(cleanEventId).emit("usersUpdate", {
        users: event.users,
      });

      console.log(`${username} joined ${cleanEventId}`);
    } catch (err) {
      console.error(err);
      socket.emit("errorMessage", "Server error");
    }
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const events = await Event.find();

    for (let event of events) {
      const before = event.users.length;

      event.users = event.users.filter(
        (u) => u.id !== socket.id
      );

      if (event.users.length !== before) {
        await event.save();

        io.to(event.eventId).emit("usersUpdate", {
          users: event.users,
        });
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});