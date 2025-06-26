import { useEffect, useState } from "react";
import "./App.css";

/**
 * The main application component for the TTTracker frontend.
 *
 * Responsible for fetching and displaying the list of players.
 *
 * TODO: Players Management
 * - [x] List all players (GET /api/players)
 * - [x] Add a new player (POST /api/players)
 * - [ ] View player details (GET /api/players/:id)
 * - [ ] Delete a player (DELETE /api/players/:id)
 * - [ ] Edit player name (PUT/PATCH /api/players/:id, if you add this endpoint)
 *
 * TODO: Matches Management
 * - [ ] List all matches (GET /api/matches)
 * - [ ] Add a new match (POST /api/matches)
 * - [ ] View match details (GET /api/matches/:id)
 * - [ ] Delete a match (DELETE /api/matches/:id)
 * - [ ] Edit match details (PUT/PATCH /api/matches/:id, if you add this endpoint)
 *
 * TODO: Player Profile Page
 * - [ ] Show player info and list all matches involving that player (requires a /api/players/:id/matches or similar endpoint).
 *
 * TODO: Dashboard/Homepage
 * - [ ] Show stats: total players, total matches, recent matches, maybe a leaderboard.
 *
 * TODO: Navigation
 * - [ ] Simple navigation bar to switch between Players, Matches, and Dashboard.
 */
function App() {
  const [players, setPlayers] = useState<any[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function createPlayer() {
    try {
      const response = await fetch("http://localhost:8080/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPlayer }),
      });
      if (!response.ok) throw new Error("Failed to create player");
      const data = await response.json();
      setPlayers((prev) => [...prev, data]);
      setNewPlayer("");
      console.log("Player created successfully:", data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPlayers() {
    try {
      const response = await fetch("http://localhost:8080/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deletePlayer(id: number) {
    try {
      const response = await fetch(`http://localhost:8080/api/players/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete player");
      setPlayers((prev) => prev.filter((player) => player.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h3>Список игроков</h3>
      <div>
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.name}
              <button onClick={() => deletePlayer(player.id)}>Удалить</button>
            </li>
          ))}
        </ul>
        <div>
          <h3>Создать нового игрока</h3>
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Введите имя игрока"
          />
          <button onClick={createPlayer}>Создать игрока</button>
        </div>
      </div>
    </>
  );
}

export default App;
