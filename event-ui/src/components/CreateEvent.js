import { useState } from "react";

function CreateEvent({ socket }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  const handleCreate = () => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }

    if (!username.trim()) {
      alert("Enter your name");
      return;
    }

    setLoading(true);

    // Send request to backend
    socket.emit("createEvent", { username });

    // Listen for success response
    socket.once("eventCreated", (data) => {
      console.log("Event Created:", data);

      setCreatedEventId(data.eventId);
      setLoading(false);

      alert(`Event Created Successfully!\nEvent ID: ${data.eventId}`);
    });

    // Listen for error
    socket.once("error", (msg) => {
      console.log("Error:", msg);
      setLoading(false);
      alert(msg);
    });

    setUsername("");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Create Event</h2>

      {/* Username Input */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your name"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Button */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className={`w-full text-white py-2 rounded-lg transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Creating..." : "Create Event →"}
      </button>

      {/* Show created event ID */}
      {createdEventId && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">
          Event Created! ID: <b>{createdEventId}</b>
        </div>
      )}
    </div>
  );
}

export default CreateEvent;