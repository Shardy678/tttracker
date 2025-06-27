"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Trophy, Users, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Match {
  id: number;
  player_a: string;
  player_b: string;
  score_a: number;
  score_b: number;
  played_at: string;
}

type MatchesPageProps = {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
};

export default function MatchesPage({ matches, setMatches }: MatchesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const filteredMatches = matches.filter(
    (match) =>
      match.player_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.player_b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
    } else {
      const totalScoreA = a.score_a + a.score_b;
      const totalScoreB = b.score_a + b.score_b;
      return totalScoreB - totalScoreA;
    }
  });

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

  const getWinner = (match: Match) => {
    if (match.score_a > match.score_b) {
      return {
        winner: match.player_a,
        loser: match.player_b,
        winnerScore: match.score_a,
        loserScore: match.score_b,
      };
    } else if (match.score_b > match.score_a) {
      return {
        winner: match.player_b,
        loser: match.player_a,
        winnerScore: match.score_b,
        loserScore: match.score_a,
      };
    } else {
      return {
        winner: "Tie",
        loser: "",
        winnerScore: match.score_a,
        loserScore: match.score_b,
      };
    }
  };

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
                  <Users className="h-6 w-6 text-blue-600" />
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
                    {Math.round(
                      matches.reduce(
                        (acc, match) => acc + match.score_a + match.score_b,
                        0
                      ) /
                        matches.length /
                        2
                    )}
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
        <div className="space-y-4">
          {sortedMatches.map((match) => {
            const { winner, winnerScore, loserScore } = getWinner(match);

            return (
              <Card
                key={match.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Match #{match.id}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(match.played_at)}
                        </span>
                      </div>

                      {/* Players and Scores */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            match.score_a > match.score_b
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {match.score_a > match.score_b && (
                              <Trophy className="h-4 w-4 text-yellow-600" />
                            )}
                            <span
                              className={`font-medium ${
                                match.score_a > match.score_b
                                  ? "text-green-800"
                                  : "text-gray-700"
                              }`}
                            >
                              {match.player_a}
                            </span>
                          </div>
                          <Badge
                            variant={
                              match.score_a > match.score_b
                                ? "default"
                                : "secondary"
                            }
                          >
                            {match.score_a}
                          </Badge>
                        </div>

                        <div
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            match.score_b > match.score_a
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {match.score_b > match.score_a && (
                              <Trophy className="h-4 w-4 text-yellow-600" />
                            )}
                            <span
                              className={`font-medium ${
                                match.score_b > match.score_a
                                  ? "text-green-800"
                                  : "text-gray-700"
                              }`}
                            >
                              {match.player_b}
                            </span>
                          </div>
                          <Badge
                            variant={
                              match.score_b > match.score_a
                                ? "default"
                                : "secondary"
                            }
                          >
                            {match.score_b}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Match Summary */}
                    <div className="lg:text-right">
                      {winner !== "Tie" ? (
                        <div>
                          <p className="text-sm text-gray-500">Winner</p>
                          <p className="font-semibold text-green-700">
                            {winner}
                          </p>
                          <p className="text-xs text-gray-400">
                            {winnerScore} - {loserScore}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-500">Result</p>
                          <p className="font-semibold text-yellow-600">
                            Tie Game
                          </p>
                          <p className="text-xs text-gray-400">
                            {match.score_a} - {match.score_b}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sortedMatches.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No matches found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "No matches have been recorded yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
