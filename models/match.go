package models

import (
	"database/sql"
	"time"
)

type Match struct {
	ID       int       `json:"id"`
	PlayerA  int       `json:"player_a"`
	PlayerB  int       `json:"player_b"`
	ScoreA   int       `json:"score_a"`
	ScoreB   int       `json:"score_b"`
	PlayedAt time.Time `json:"played_at"`
}

func GetAllMatches(db *sql.DB) ([]Match, error) {
	rows, err := db.Query("SELECT id, player_a, player_b, score_a, score_b, played_at FROM matches")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var match Match
		if err := rows.Scan(&match.ID, &match.PlayerA, &match.PlayerB, &match.ScoreA, &match.ScoreB, &match.PlayedAt); err != nil {
			return nil, err
		}
		matches = append(matches, match)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return matches, nil
}
func CreateMatch(db *sql.DB, playerA, playerB, scoreA, scoreB int) (int64, error) {
	result, err := db.Exec("INSERT INTO matches (player_a, player_b, score_a, score_b) VALUES (?, ?, ?, ?)", playerA, playerB, scoreA, scoreB)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

func GetMatchByID(db *sql.DB, id int) (*Match, error) {
	row := db.QueryRow("SELECT id, player_a, player_b, score_a, score_b, played_at FROM matches WHERE id = ?", id)
	var match Match
	if err := row.Scan(&match.ID, &match.PlayerA, &match.PlayerB, &match.ScoreA, &match.ScoreB, &match.PlayedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No match found
		}
		return nil, err
	}
	return &match, nil
}

func DeleteMatch(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM matches WHERE id = ?", id)
	return err
}

func UpdateMatch(db *sql.DB, id, playerA, playerB, scoreA, scoreB int) error {
	_, err := db.Exec("UPDATE matches SET player_a = ?, player_b = ?, score_a = ?, score_b = ? WHERE id = ?", playerA, playerB, scoreA, scoreB, id)
	return err
}
func GetMatchesByPlayer(db *sql.DB, playerID int) ([]Match, error) {
	rows, err := db.Query("SELECT id, player_a, player_b, score_a, score_b, played_at FROM matches WHERE player_a = ? OR player_b = ?", playerID, playerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var match Match
		if err := rows.Scan(&match.ID, &match.PlayerA, &match.PlayerB, &match.ScoreA, &match.ScoreB, &match.PlayedAt); err != nil {
			return nil, err
		}
		matches = append(matches, match)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return matches, nil
}
