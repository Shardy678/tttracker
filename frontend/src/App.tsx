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
 * - [x] Delete a player (DELETE /api/players/:id)
 * - [ ] Edit player name (PUT/PATCH /api/players/:id, if you add this endpoint)
 *
 * TODO: Matches Management
 * - [x] List all matches (GET /api/matches)
 * - [x] Add a new match (POST /api/matches)
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
type Match = {
  id: number;
  player_a: number;
  player_b: number;
  score_a: number;
  score_b: number;
};

function App() {
  const [players, setPlayers] = useState<any[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [score1, setScore1] = useState<number | null>(null);
  const [score2, setScore2] = useState<number | null>(null);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
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

  async function createMatch(
    player_a: string,
    player_b: string,
    score_a: number,
    score_b: number
  ) {
    try {
      const response = await fetch("http://localhost:8080/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_a: player_a,
          player_b: player_b,
          score_a: score_a,
          score_b: score_b,
        }),
      });
      if (!response.ok) throw new Error("Failed to create match");
      const data = await response.json();
      setMatches((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchMatches() {
    try {
      const response = await fetch("http://localhost:8080/api/matches");
      if (!response.ok) throw new Error("Failed to fetch matches");
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h1>TTTracker</h1>
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
      <div>
        <h3>Список матчей</h3>
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              {match.player_a} vs {match.player_b} - {match.score_a}:
              {match.score_b}{" "}
              <span>({new Date(match.played_at).toLocaleString()})</span>
            </li>
          ))}
          {matches.length === 0 && <li>Нет матчей</li>}
        </ul>
      </div>
      <div>
        <h3>Создать матч</h3>
        <input
          type="text"
          placeholder="Имя игрока 1"
          onChange={(e) => setPlayer1(String(e.target.value))}
        />
        <input
          type="text"
          placeholder="Имя игрока 2"
          onChange={(e) => setPlayer2(String(e.target.value))}
        />
        <input
          type="number"
          placeholder="Счет игрока 1"
          onChange={(e) => setScore1(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Счет игрока 2"
          onChange={(e) => setScore2(Number(e.target.value))}
        />
        <button
          onClick={() => {
            if (
              player1 !== null &&
              player2 !== null &&
              score1 !== null &&
              score2 !== null
            ) {
              const p1 = players.find((p) => p.name === player1);
              const p2 = players.find((p) => p.name === player2);
              if (p1 && p2) {
                createMatch(p1.id, p2.id, score1, score2);
              } else {
                alert("Один или оба игрока не найдены");
              }
            }
          }}
          disabled={
            player1 === null ||
            player2 === null ||
            score1 === null ||
            score2 === null
          }
        >
          Создать матч
        </button>
      </div>
    </>
  );
}

export default App;
