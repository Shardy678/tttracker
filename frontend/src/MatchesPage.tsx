import { useEffect, useState } from "react";

type Match = {
  id: number;
  player_a: number;
  player_b: number;
  score_a: number;
  score_b: number;
  played_at: string;
};

type Player = {
  id: number;
  name: string;
  created_at: string;
};

type MatchesPageProps = {
  players: Player[];
  setMatches: (matches: Match[]) => void;
  matches: Match[];
};

export default function MatchesPage({
  players,
  setMatches,
  matches,
}: MatchesPageProps) {
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [score1, setScore1] = useState<number | null>(null);
  const [score2, setScore2] = useState<number | null>(null);

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
      setMatches([...matches, data]);
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
  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div>
      <h3>Список матчей</h3>
      <ul>
        {matches.map((match) => (
          <li key={match.id}>
            {match.player_a} vs {match.player_b} - {match.score_a}:
            {match.score_b}{" "}
            <span>
              ({new Date(Date.parse(match.played_at)).toLocaleString()})
            </span>
          </li>
        ))}
        {matches.length === 0 && <li>Нет матчей</li>}
      </ul>
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
                createMatch(p1.name, p2.name, score1, score2);
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
    </div>
  );
}
