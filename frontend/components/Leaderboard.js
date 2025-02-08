// frontend/components/Leaderboard.js
export default function Leaderboard({ data }) {
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
  