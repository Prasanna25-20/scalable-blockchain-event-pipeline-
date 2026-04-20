import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

import CreateEvent from "./components/CreateEvent";
import JoinEvent from "./components/JoinEvent";
import EventDashboard from "./components/EventDashboard";

function App() {
  const [socket, setSocket] = useState(null); // ✅ managed socket
  const [eventId, setEventId] = useState("");
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [connected, setConnected] = useState(false);

  // ✅ initialize socket once
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // cleanup
    };
  }, []);

  // ✅ attach listeners AFTER socket exists
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      console.log("Connected:", socket.id);
      toast.success("Connected 🚀");
    };

    const onDisconnect = () => {
      setConnected(false);
      toast.error("Disconnected ❌");
    };

    const onEventCreated = (data) => {
      setEventId(data.eventId);
      setUsers(data.users || []);

      setActivity((prev) => [
        {
          text: "Event created",
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      toast.success("Event Created 🎉");
    };

    const onUsersUpdate = (data) => {
      setUsers(data.users || []);

      setActivity((prev) => [
        {
          text: "User joined / left",
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    };

    const onError = (msg) => {
      toast.error(msg);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("eventCreated", onEventCreated);
    socket.on("usersUpdate", onUsersUpdate);
    socket.on("errorMessage", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("eventCreated", onEventCreated);
      socket.off("usersUpdate", onUsersUpdate);
      socket.off("errorMessage", onError);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Navbar */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">
          EventFlow
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Real-time Event System
          </span>

          {/* ✅ Connection status */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              connected
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {connected ? "● Connected" : "● Offline"}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <CreateEvent socket={socket} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <JoinEvent socket={socket} />
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
          <EventDashboard
            eventId={eventId}
            users={users || []}   // extra safety
            activity={activity}
          />
        </div>

      </div>
    </div>
  );
}

export default App;