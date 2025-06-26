import { useState, useEffect } from "react";

type Player = {
  id: number;
  name: string;
  created_at: string;
};

type ScoreTrackerProps = {
  players: Player[];
};

export default function ScoreTracker({ players }: ScoreTrackerProps) {
  const [playerAId, setPlayerAId] = useState<number | "">("");
  const [playerBId, setPlayerBId] = useState<number | "">("");
  const [namesSet, setNamesSet] = useState(false);
  const [firstServer, setFirstServer] = useState<"A" | "B">("A");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [server, setServer] = useState<"A" | "B">("A");

  // Helper: get name by ID
  const findName = (id: number | "") =>
    players.find((p) => p.id === id)?.name ?? "";

  // POST by name
  async function createMatch(
    player_a: string,
    player_b: string,
    score_a: number,
    score_b: number
  ) {
    try {
      const response = await fetch("http://localhost:8080/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_a, player_b, score_a, score_b }),
      });
      if (!response.ok) throw new Error("Failed to create match");
      const data = await response.json();
      console.log("Match created:", data);
    } catch (error) {
      console.error(error);
    }
  }

  // Detect end of game
  useEffect(() => {
    const diff = Math.abs(scoreA - scoreB);
    if (!((scoreA >= 11 || scoreB >= 11) && diff >= 2)) return;

    const winner = scoreA > scoreB ? "A" : "B";
    const nameA = findName(playerAId);
    const nameB = findName(playerBId);

    // Send names
    createMatch(nameA, nameB, scoreA, scoreB);

    alert(`Матч окончен! Победитель: ${winner === "A" ? nameA : nameB}.`);

    // Reset
    setScoreA(0);
    setScoreB(0);
    setServer(firstServer);
  }, [scoreA, scoreB, firstServer, playerAId, playerBId]);

  // Point handler
  const handlePoint = (player: "A" | "B") => {
    if (player === "A") setScoreA((a) => a + 1);
    else setScoreB((b) => b + 1);

    const total = scoreA + scoreB + 1;
    const deuce = scoreA >= 10 && scoreB >= 10;
    if ((!deuce && total % 2 === 0) || (deuce && total % 1 === 0)) {
      setServer((s) => (s === "A" ? "B" : "A"));
    }
  };

  if (!namesSet) {
    return (
      <div style={{ maxWidth: 300, margin: "auto", textAlign: "center" }}>
        <h2>Выберите игроков</h2>

        <select
          value={playerAId}
          onChange={(e) => setPlayerAId(Number(e.target.value) || "")}
          style={{ display: "block", width: "90%", margin: "8px auto" }}
        >
          <option value="">— Игрок A —</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={playerBId}
          onChange={(e) => setPlayerBId(Number(e.target.value) || "")}
          style={{ display: "block", width: "90%", margin: "8px auto" }}
        >
          <option value="">— Игрок B —</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div style={{ margin: "12px 0" }}>
          <label>Кто подаёт первым?</label>
          <div>
            <label style={{ marginRight: 16 }}>
              <input
                type="radio"
                name="firstServer"
                value="A"
                checked={firstServer === "A"}
                onChange={() => setFirstServer("A")}
              />
              Игрок A
            </label>
            <label>
              <input
                type="radio"
                name="firstServer"
                value="B"
                checked={firstServer === "B"}
                onChange={() => setFirstServer("B")}
              />
              Игрок B
            </label>
          </div>
        </div>

        <button
          onClick={() => {
            setNamesSet(true);
            setServer(firstServer);
          }}
          disabled={!playerAId || !playerBId || playerAId === playerBId}
        >
          Начать матч
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 300, margin: "auto", textAlign: "center" }}>
      <h2>Счёт матча</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>
          Подаёт: {server === "A" ? findName(playerAId) : findName(playerBId)}
        </strong>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>{findName(playerAId)}</h3>
          <button
            onClick={() => setScoreA((a) => Math.max(0, a - 1))}
            disabled={scoreA === 0}
          >
            −
          </button>
          <span style={{ margin: "0 10px" }}>{scoreA}</span>
          <button onClick={() => handlePoint("A")}>+</button>
        </div>
        <div>
          <h3>{findName(playerBId)}</h3>
          <button
            onClick={() => setScoreB((b) => Math.max(0, b - 1))}
            disabled={scoreB === 0}
          >
            −
          </button>
          <span style={{ margin: "0 10px" }}>{scoreB}</span>
          <button onClick={() => handlePoint("B")}>+</button>
        </div>
      </div>
    </div>
  );
}
