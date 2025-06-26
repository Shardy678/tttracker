package models

import "database/sql"

type Player struct {
	ID        int    `json:"id"`
	Name      string `json:"name" binding:"required"`
	CreatedAt string `json:"created_at"`
}

func GetAllPlayers(db *sql.DB) ([]Player, error) {
	rows, err := db.Query("SELECT id, name, created_at FROM players")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var player Player
		if err := rows.Scan(&player.ID, &player.Name, &player.CreatedAt); err != nil {
			return nil, err
		}
		players = append(players, player)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return players, nil
}

func CreatePlayer(db *sql.DB, name string) (*Player, error) {
	result, err := db.Exec("INSERT INTO players (name) VALUES (?)", name)
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	player := &Player{
		ID:   int(id),
		Name: name,
	}
	return player, nil
}

func GetPlayerByID(db *sql.DB, id int) (*Player, error) {
	row := db.QueryRow("SELECT id, name, created_at FROM players WHERE id = ?", id)
	var player Player
	if err := row.Scan(&player.ID, &player.Name, &player.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &player, nil
}

func DeletePlayer(db *sql.DB, id int) error {
	_, err := db.Exec("DELETE FROM players WHERE id = ?", id)
	if err != nil {
		return err
	}
	return nil
}

func UpdatePlayer(db *sql.DB, id int, name string) error {
	_, err := db.Exec("UPDATE players SET name = ? WHERE id = ?", name, id)
	return err
}
