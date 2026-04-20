function EventDashboard({ eventId, users = [], activity = [] }) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Live Dashboard</h2>

        {eventId && (
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
              ID: {eventId}
            </span>

            <button
              onClick={() => navigator.clipboard.writeText(eventId)}
              className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {!eventId ? (
        <div className="text-center py-16 text-gray-400 border rounded-xl">
          <h3 className="text-xl font-semibold">
            No Active Event
          </h3>
          <p className="text-sm mt-2">
            Create or join an event to start monitoring
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">

          {/* USERS LIST */}
          <div className="border rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm text-gray-500">
                Active Users ({users?.length || 0})
              </h3>

              <span className="text-xs text-green-500 font-medium">
                ● Live
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users?.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No users yet
                </p>
              ) : (
                users.map((user, i) => (
                  <div
                    key={user.id || i}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm hover:shadow transition"
                  >
                    <span className="text-sm flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      {user.name}
                    </span>

                    <span className="text-green-500 text-xs">
                      ● online
                    </span>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Real-time connected users
            </p>
          </div>

          {/* ACTIVITY FEED */}
          <div className="border rounded-xl p-6">
            <h3 className="text-sm text-gray-500 mb-3">
              Activity Feed
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activity?.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No activity yet
                </p>
              ) : (
                activity.map((a, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm">{a.text}</span>
                    <span className="text-xs text-gray-400">
                      {a.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default EventDashboard;