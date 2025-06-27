package models

import (
	"database/sql"
	"fmt"
)

type Player struct {
	ID        int    `json:"id"`
	Name      string `json:"name" binding:"required"`
	CreatedAt string `json:"created_at"`
}

// --------------------
// Player CRUD
// --------------------

// GetAllPlayers retrieves all players from the database.
func GetAllPlayers(db *sql.DB) ([]Player, error) {
	rows, err := db.Query("SELECT id, name, created_at FROM players")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var p Player
		if err := rows.Scan(&p.ID, &p.Name, &p.CreatedAt); err != nil {
			return nil, err
		}
		players = append(players, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return players, nil
}

// CreatePlayer inserts a new player and returns its ID.
func CreatePlayer(db *sql.DB, name string) (*Player, error) {
	if name == "" {
		return nil, fmt.Errorf("invalid input: name required")
	}
	res, err := db.Exec("INSERT INTO players (name) VALUES (?)", name)
	if err != nil {
		return nil, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}
	// Fetch the created player (including created_at)
	return GetPlayerByID(db, int(id))
}

// GetPlayerByID fetches a single player by its ID.
func GetPlayerByID(db *sql.DB, id int) (*Player, error) {
	r := db.QueryRow("SELECT id, name, created_at FROM players WHERE id = ?", id)
	var p Player
	if err := r.Scan(&p.ID, &p.Name, &p.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

// UpdatePlayer changes the name of an existing player.
func UpdatePlayer(db *sql.DB, id int, name string) error {
	if name == "" {
		return fmt.Errorf("invalid input: name required")
	}
	_, err := db.Exec("UPDATE players SET name = ? WHERE id = ?", name, id)
	return err
}

// DeletePlayer removes a player by ID.
func DeletePlayer(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM players WHERE id = ?", id)
	return err
}