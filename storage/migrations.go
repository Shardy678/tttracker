package storage

import "database/sql"

// runMigrations applies the necessary migrations to the database
func runMigrations(db *sql.DB) {
	schema := []string{
		`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
		`CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_a INTEGER NOT NULL,
            player_b INTEGER NOT NULL,
            score_a INTEGER NOT NULL,
            score_b INTEGER NOT NULL,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(player_a) REFERENCES players(id),
            FOREIGN KEY(player_b) REFERENCES players(id)
        );`,
	}
	for _, stmt := range schema {
		if _, err := db.Exec(stmt); err != nil {
			panic(err)
		}
	}
}
