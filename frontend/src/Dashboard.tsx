import {
  Target,
  Users,
  TrendingUp,
  Trophy,
  Zap,
  Award,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import type { Match } from "./utils";

type Player = {
  id: number;
  name: string;
};

type LeaderboardPlayer = {
  player: number;
  wins: number;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMatchResult(match: Match) {
  if (match.score_a > match.score_b) {
    return {
      winner: match.player_a_id,
      loser: match.player_b_id,
      winnerScore: match.score_a,
      loserScore: match.score_b,
    };
  } else if (match.score_b > match.score_a) {
    return {
      winner: match.player_b_id,
      loser: match.player_a_id,
      winnerScore: match.score_b,
      loserScore: match.score_a,
    };
  } else {
    return {
      winner: null,
      loser: null,
      winnerScore: match.score_a,
      loserScore: match.score_b,
    };
  }
}

async function fetchStats() {
  try {
    const response = await fetch("http://localhost:8080/api/stats");
    if (!response.ok) throw new Error("Failed to fetch stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

async function fetchPlayers() {
  try {
    const response = await fetch("http://localhost:8080/api/players");
    if (!response.ok) throw new Error("Failed to fetch players");
    return (await response.json()) as Player[];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

export default function Dashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    async function loadData() {
      const [stats, playerList] = await Promise.all([
        fetchStats(),
        fetchPlayers(),
      ]);
      if (stats) setStatsData(stats);
      if (playerList) setPlayers(playerList);
    }
    loadData();
  }, []);

  const playerNames = useMemo(() => {
    const map: Record<number, string> = {};
    players.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [players]);

  if (!statsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading stats...</p>
      </div>
    );
  }

  const championName = playerNames[statsData.most_wins] || statsData.most_wins;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Game Stats Dashboard
          </h1>
          <p className="text-slate-600">Track your matches and performance</p>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Matches
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {statsData.matches}
              </div>
              <p className="text-xs text-slate-500">Games played</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active Players
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {statsData.players}
              </div>
              <p className="text-xs text-slate-500">Total players</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {statsData.average_score.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500">Points per game</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Champion
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {championName}
              </div>
              <p className="text-xs text-slate-500">Most wins</p>
            </CardContent>
          </Card>
        </div>

        {/* Highlights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biggest Win */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 ring-1 ring-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Zap className="h-5 w-5" />
                Biggest Win
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-900">
                    {playerNames[statsData.biggest_win.winner] ||
                      statsData.biggest_win.winner}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    Winner
                  </Badge>
                </div>
                <div className="text-sm text-orange-700">
                  Beat{" "}
                  {playerNames[statsData.biggest_win.loser] ||
                    statsData.biggest_win.loser}{" "}
                  by {statsData.biggest_win.margin} points
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Common Score */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 ring-1 ring-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Award className="h-5 w-5" />
                Most Common Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900">
                  {statsData.most_common_score.a} -{" "}
                  {statsData.most_common_score.b}
                </div>
                <div className="text-sm text-blue-700">
                  Occurred {statsData.most_common_score.count} times
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard and Recent Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Leaderboard
              </CardTitle>
              <CardDescription>Players ranked by wins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsData.leaderboard.map(
                  (lb: LeaderboardPlayer, idx: number) => (
                    <div
                      key={lb.player}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : idx === 1
                              ? "bg-slate-100 text-slate-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="font-medium text-slate-900">
                          {playerNames[lb.player] || lb.player}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {lb.wins} {lb.wins === 1 ? "win" : "wins"}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Recent Matches
              </CardTitle>
              <CardDescription>Latest game results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsData.recent_matches.slice(0, 5).map((match: Match) => {
                  const result = getMatchResult(match);
                  const isDraw = result.winner === null;

                  return (
                    <div
                      key={match.id}
                      className="p-3 rounded-lg bg-slate-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-900">
                          {playerNames[match.player_a_id] || match.player_a_id}{" "}
                          vs{" "}
                          {playerNames[match.player_b_id] || match.player_b_id}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(match.played_at)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-slate-900">
                          {match.score_a} - {match.score_b}
                        </div>
                        {!isDraw && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {playerNames[result.winner!] || result.winner} wins
                          </Badge>
                        )}
                        {isDraw && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            Draw
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
