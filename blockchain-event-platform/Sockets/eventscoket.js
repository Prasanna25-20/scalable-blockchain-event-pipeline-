const Event = require("../models/Event");

module.exports = (io) => {
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
        console.error("Create Event Error:", err);
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

        // join room safely
        if (!socket.rooms.has(cleanEventId)) {
          socket.join(cleanEventId);
        }

        io.to(cleanEventId).emit("usersUpdate", {
          users: event.users,
        });

        console.log(`${username} joined ${cleanEventId}`);
      } catch (err) {
        console.error("Join Event Error:", err);
        socket.emit("errorMessage", "Server error");
      }
    });

    // =========================
    // DISCONNECT (FIXED + OPTIMIZED)
    // =========================
    socket.on("disconnect", async () => {
      try {
        console.log("User disconnected:", socket.id);

        // ONLY fetch events where user exists (NOT full scan)
        const events = await Event.find({
          "users.id": socket.id,
        });

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
      } catch (err) {
        console.error("Disconnect Error:", err);
      }
    });
  });
};