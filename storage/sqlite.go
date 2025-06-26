package storage

import (
    "database/sql"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

// Open initializes and returns a SQLite DB connection
func Open(dbPath string) *sql.DB {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        log.Fatalf("failed to open database: %v", err)
    }
    runMigrations(db)
    return db
}