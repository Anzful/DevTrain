// frontend/components/Leaderboard.js
export default function Leaderboard({ data }) {
<<<<<<< HEAD
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <ul className="divide-y">
        {data.map((user, index) => (
          <li key={user._id} className="flex justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center">
              <span className="font-medium w-8">{index + 1}.</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex space-x-4">
              <div className="text-gray-600">
                <span className="font-semibold">{user.experiencePoints}</span> XP
              </div>
              <div className="text-gray-600">
                <span className="font-semibold">{user.successfulSubmissions || 0}</span> solved
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
=======
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
        <ul>
          {data.map((entry, index) => (
            <li key={entry.user._id} className="flex justify-between p-2 border-b">
              <span>{index + 1}. {entry.user.name}</span>
              <span>{entry.score}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
  