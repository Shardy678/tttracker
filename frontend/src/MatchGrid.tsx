import type { Match, Player } from "@/utils";
import { Card, CardContent } from "./components/ui/card";

type MatchGridProps = {
  matches: Match[];
  players: Player[];
};

export default function MatchGrid({ matches, players }: MatchGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getWinner = (score1: number, score2: number) => {
    return score1 > score2 ? "player1" : "player2";
  };

  const getPlayerName = (id: number) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : `Player #${id}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Table Tennis Matches
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {matches.map((match) => {
          const nameA = getPlayerName(match.player_a_id);
          const nameB = getPlayerName(match.player_b_id);
          const winner = getWinner(match.score_a, match.score_b);
          return (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium truncate ${
                        winner === "player1"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {nameA}
                    </span>
                    <span
                      className={`text-lg font-bold min-w-[24px] text-center ${
                        winner === "player1"
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {match.score_a}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium truncate ${
                        winner === "player2"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {nameB}
                    </span>
                    <span
                      className={`text-lg font-bold min-w-[24px] text-center ${
                        winner === "player2"
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {match.score_b}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(match.played_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
