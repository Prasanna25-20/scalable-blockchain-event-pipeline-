import { useState } from "react";

function JoinEvent({ socket }) {
  const [eventId, setEventId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }

    if (!eventId.trim()) {
      alert("Enter Event ID");
      return;
    }

    if (!username.trim()) {
      alert("Enter your name");
      return;
    }

    // ✅ match backend
    socket.emit("joinEvent", { eventId, username });

    setEventId("");
    setUsername("");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Join Event</h2>

      {/* Username */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your name"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Event ID */}
      <input
        type="text"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        placeholder="Enter Event ID"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <button
        onClick={handleJoin}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        Join Event →
      </button>
    </div>
  );
}

export default JoinEvent;