import { useState, useEffect } from "react";
import type { Player } from "./utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

type MergedScorerProps = {
  players: Player[];
};

export default function MergedTableTennisScorer({
  players,
}: MergedScorerProps) {
  const [playerAId, setPlayerAId] = useState<number>(0);
  const [playerBId, setPlayerBId] = useState<number>(0);
  const [namesSet, setNamesSet] = useState(false);
  const [firstServer, setFirstServer] = useState<"A" | "B">("A");
  const [server, setServer] = useState<"A" | "B">("A");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  // Helper: get name by ID
  const findName = (id: number | "") =>
    players.find((p) => p.id === id)?.name ?? "";

  // POST match result
  async function createMatch(
    player_a_id: number,
    player_b_id: number,
    score_a: number,
    score_b: number
  ) {
    try {
      const response = await fetch("http://localhost:8080/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_a_id, player_b_id, score_a, score_b }),
      });
      if (!response.ok) throw new Error("Failed to create match");
      const data = await response.json();
      console.log("Match created:", data);
    } catch (error) {
      console.error(error);
    }
  }

  // Detect end of game (first to 11, 2 point lead)
  useEffect(() => {
    const diff = Math.abs(scoreA - scoreB);
    if (!((scoreA >= 11 || scoreB >= 11) && diff >= 2)) return;

    const winner = scoreA > scoreB ? "A" : "B";
    const nameA = findName(playerAId);
    const nameB = findName(playerBId);

    createMatch(playerAId, playerBId, scoreA, scoreB);
    alert(`Матч окончен! Победитель: ${winner === "A" ? nameA : nameB}.`);

    // Reset for next match
    setScoreA(0);
    setScoreB(0);
    setServer(firstServer);
  }, [scoreA, scoreB, firstServer, playerAId, playerBId]);

  // Handle point increment
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Настройка матча</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Игрок A:</label>
              <select
                value={playerAId}
                onChange={(e) => setPlayerAId(Number(e.target.value))}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">— Выберите игрока —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Игрок B:</label>
              <select
                value={playerBId}
                onChange={(e) => setPlayerBId(Number(e.target.value))}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="">— Выберите игрока —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Первый подаёт:</label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={firstServer === "A" ? "secondary" : "outline"}
                  onClick={() => setFirstServer("A")}
                >
                  Игрок A
                </Button>
                <Button
                  variant={firstServer === "B" ? "secondary" : "outline"}
                  onClick={() => setFirstServer("B")}
                >
                  Игрок B
                </Button>
              </div>
            </div>
            <div className="text-right">
              <Button
                onClick={() => {
                  setNamesSet(true);
                  setServer(firstServer);
                }}
                disabled={!playerAId || !playerBId || playerAId === playerBId}
              >
                Начать матч
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Счёт матча</h1>
          <p className="text-gray-600">
            Подаёт: {server === "A" ? findName(playerAId) : findName(playerBId)}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Player A */}
          <Card
            className={`${
              server === "A" ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>{findName(playerAId)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-6xl font-bold text-blue-600">{scoreA}</div>
              <div className="flex justify-center gap-2">
                <Button onClick={() => handlePoint("A")}>+1</Button>
                <Button
                  variant="outline"
                  onClick={() => setScoreA((a) => Math.max(0, a - 1))}
                  disabled={scoreA === 0}
                >
                  -1
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Player B */}
          <Card
            className={`${
              server === "B" ? "ring-2 ring-red-500 bg-red-50" : ""
            }`}
          >
            <CardHeader>
              <CardTitle>{findName(playerBId)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-6xl font-bold text-red-600">{scoreB}</div>
              <div className="flex justify-center gap-2">
                <Button onClick={() => handlePoint("B")}>+1</Button>
                <Button
                  variant="outline"
                  onClick={() => setScoreB((b) => Math.max(0, b - 1))}
                  disabled={scoreB === 0}
                >
                  -1
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Button
              onClick={() => {
                setScoreA(0);
                setScoreB(0);
                setServer(firstServer);
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить счёт
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
