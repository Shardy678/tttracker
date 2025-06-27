import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Trophy, Search, Target } from "lucide-react";
import type { Match, Player } from "@/utils";
import MatchGrid from "./MatchGrid";

type MatchesPageProps = {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
};

export default function MatchesPage({ matches, setMatches }: MatchesPageProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  // Fetch players mapping
  async function fetchPlayers() {
    try {
      const response = await fetch("http://localhost:8080/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data: Player[] = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch matches
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
    // Load both players and matches on mount
    fetchPlayers();
    fetchMatches();
  }, []);

  const getPlayerName = (id: number) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : `Player #${id}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMatches = matches.filter((match) => {
    const nameA = getPlayerName(match.player_a_id).toLowerCase();
    const nameB = getPlayerName(match.player_b_id).toLowerCase();
    return (
      nameA.includes(searchTerm.toLowerCase()) ||
      nameB.includes(searchTerm.toLowerCase())
    );
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
    } else {
      const totalA = a.score_a + a.score_b;
      const totalB = b.score_a + b.score_b;
      return totalB - totalA;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Match Results</h1>
          </div>
          <p className="text-gray-600">
            View and track all match results and player performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Matches
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.length > 0
                      ? (
                          matches.reduce(
                            (sum, m) => sum + m.score_a + m.score_b,
                            0
                          ) / matches.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Latest Match
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDate(matches[0]?.played_at).split(",")[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "date" ? "default" : "outline"}
                  onClick={() => setSortBy("date")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  By Date
                </Button>
                <Button
                  variant={sortBy === "score" ? "default" : "outline"}
                  onClick={() => setSortBy("score")}
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  By Score
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        <MatchGrid matches={sortedMatches} players={players} />
      </div>
    </div>
  );
}
