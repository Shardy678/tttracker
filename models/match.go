package models

import (
	"database/sql"
	"fmt"
	"time"
)

// Match represents a game played between two players.
type Match struct {
	ID        int       `json:"id"`
	PlayerAID int       `json:"player_a_id"`
	PlayerBID int       `json:"player_b_id"`
	ScoreA    int       `json:"score_a"`
	ScoreB    int       `json:"score_b"`
	PlayedAt  time.Time `json:"played_at"`
}

// --------------------
// Match CRUD
// --------------------

// GetAllMatches retrieves all matches from the database.
func GetAllMatches(db *sql.DB) ([]Match, error) {
	rows, err := db.Query("SELECT id, player_a_id, player_b_id, score_a, score_b, played_at FROM matches")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var m Match
		if err := rows.Scan(&m.ID, &m.PlayerAID, &m.PlayerBID, &m.ScoreA, &m.ScoreB, &m.PlayedAt); err != nil {
			return nil, err
		}
		matches = append(matches, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return matches, nil
}

// CreateMatch inserts a new match and returns its ID.
func CreateMatch(db *sql.DB, playerAID, playerBID, scoreA, scoreB int) (int64, error) {
    // 1) Basic validation
    if playerAID <= 0 || playerBID <= 0 {
        return 0, fmt.Errorf("invalid input: player IDs must be positive")
    }
    if scoreA < 0 || scoreB < 0 {
        return 0, fmt.Errorf("invalid input: scores must be non-negative")
    }
    // 2) Existence checks
    var tmp int
    for _, id := range []int{playerAID, playerBID} {
        err := db.QueryRow("SELECT 1 FROM players WHERE id = ?", id).Scan(&tmp)
        if err == sql.ErrNoRows {
            return 0, fmt.Errorf("player %d does not exist", id)
        }
        if err != nil {
            return 0, fmt.Errorf("checking player %d: %w", id, err)
        }
    }

    // 3) Do the insert
    res, err := db.Exec(
        "INSERT INTO matches (player_a_id, player_b_id, score_a, score_b) VALUES (?, ?, ?, ?)",
        playerAID, playerBID, scoreA, scoreB,
    )
    if err != nil {
        // If you still see "constraint failed" here, make sure you ran:
        //     db.Exec("PRAGMA foreign_keys = ON;")
        return 0, fmt.Errorf("insert match: %w", err)
    }
    return res.LastInsertId()
}


// GetMatchByID fetches a single match by its ID.
func GetMatchByID(db *sql.DB, id int) (*Match, error) {
	r := db.QueryRow(
		"SELECT id, player_a_id, player_b_id, score_a, score_b, played_at FROM matches WHERE id = ?",
		id,
	)
	var m Match
	if err := r.Scan(&m.ID, &m.PlayerAID, &m.PlayerBID, &m.ScoreA, &m.ScoreB, &m.PlayedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

// UpdateMatch modifies fields of an existing match.
func UpdateMatch(db *sql.DB, id, playerAID, playerBID, scoreA, scoreB int) error {
	if playerAID <= 0 || playerBID <= 0 {
		return fmt.Errorf("invalid input: player IDs must be positive")
	}
	if scoreA < 0 || scoreB < 0 {
		return fmt.Errorf("invalid input: scores must be non-negative")
	}
	_, err := db.Exec(
		"UPDATE matches SET player_a_id = ?, player_b_id = ?, score_a = ?, score_b = ? WHERE id = ?",
		playerAID, playerBID, scoreA, scoreB, id,
	)
	return err
}

// DeleteMatch removes a match by ID.
func DeleteMatch(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM matches WHERE id = ?", id)
	return err
}

// GetMatchesByPlayer retrieves all matches involving a given player.
func GetMatchesByPlayer(db *sql.DB, playerID int) ([]Match, error) {
	rows, err := db.Query(
		"SELECT id, player_a_id, player_b_id, score_a, score_b, played_at FROM matches WHERE player_a_id = ? OR player_b_id = ?",
		playerID, playerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var m Match
		if err := rows.Scan(&m.ID, &m.PlayerAID, &m.PlayerBID, &m.ScoreA, &m.ScoreB, &m.PlayedAt); err != nil {
			return nil, err
		}
		matches = append(matches, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return matches, nil
}
