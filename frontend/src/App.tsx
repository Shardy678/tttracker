import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import PlayersPage from "./PlayersPage";
import MatchesPage from "./MatchesPage";
import ScoreTracker from "./ScoreTracker";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";

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

function App() {
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/players"
          element={<PlayersPage players={players} setPlayers={setPlayers} />}
        />
        <Route
          path="/matches"
          element={<MatchesPage matches={matches} setMatches={setMatches} />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tracker" element={<ScoreTracker players={players} />} />
      </Routes>
    </>
  );
}

export default App;
