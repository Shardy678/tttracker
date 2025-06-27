package handlers

import (
	"database/sql"
	"net/http"
	"tttracker/models"

	"github.com/gin-gonic/gin"

	"log"
)

func GetStats(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Total players
        var playerCount int
        if err := db.QueryRow("SELECT COUNT(*) FROM players").Scan(&playerCount); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count players"})
            return
        }

        // Total matches
        var matchCount int
        if err := db.QueryRow("SELECT COUNT(*) FROM matches").Scan(&matchCount); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count matches"})
            return
        }

        // Recent matches
        rows, err := db.Query("SELECT id, player_a_id, player_b_id, score_a, score_b, played_at FROM matches ORDER BY played_at DESC LIMIT 5")
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent matches"})
            log.Printf("GetStats error: %v", err)
            return
        }
        defer rows.Close()

        var recent []models.Match
        for rows.Next() {
            var m models.Match
            if err := rows.Scan(&m.ID, &m.PlayerAID, &m.PlayerBID, &m.ScoreA, &m.ScoreB, &m.PlayedAt); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan match"})
                return
            }
            recent = append(recent, m)
        }
        if err := rows.Err(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading recent matches"})
            return
        }
        // Most active player
        var mostActive string
        _ = db.QueryRow(`
            SELECT player FROM (
                SELECT player_a_id AS player FROM matches
                UNION ALL
                SELECT player_b_id AS player FROM matches
            ) GROUP BY player ORDER BY COUNT(*) DESC LIMIT 1
        `).Scan(&mostActive)

        // Player with most wins
        var mostWins string
        _ = db.QueryRow(`
            SELECT winner FROM (
                SELECT CASE 
                    WHEN score_a > score_b THEN player_a_id
                    WHEN score_b > score_a THEN player_b_id
                    ELSE NULL
                END as winner
                FROM matches
            ) WHERE winner IS NOT NULL GROUP BY winner ORDER BY COUNT(*) DESC LIMIT 1
        `).Scan(&mostWins)

        // Most common score
        var commonScoreA, commonScoreB, freq int
        _ = db.QueryRow(`
            SELECT score_a, score_b, COUNT(*) as freq
            FROM matches
            GROUP BY score_a, score_b
            ORDER BY freq DESC
            LIMIT 1
        `).Scan(&commonScoreA, &commonScoreB, &freq)

        // Biggest win margin
        var margin int
        var winner, loser string
        _ = db.QueryRow(`
            SELECT ABS(score_a - score_b) as margin, 
                CASE WHEN score_a > score_b THEN player_a_id ELSE player_b_id END as winner,
                CASE WHEN score_a > score_b THEN player_b_id ELSE player_a_id END as loser
            FROM matches
            WHERE score_a != score_b
            ORDER BY margin DESC
            LIMIT 1
        `).Scan(&margin, &winner, &loser)

        // Average score per match
        var avgScore float64
        _ = db.QueryRow(`SELECT AVG(score_a + score_b) FROM matches`).Scan(&avgScore)

        // Leaderboard (top 5 by wins)
        leaderRows, err := db.Query(`
            SELECT winner, COUNT(*) as wins FROM (
                SELECT CASE 
                    WHEN score_a > score_b THEN player_a_id
                    WHEN score_b > score_a THEN player_b_id
                    ELSE NULL
                END as winner
                FROM matches
            ) WHERE winner IS NOT NULL GROUP BY winner ORDER BY wins DESC LIMIT 5
        `)
        type Leader struct {
            Player string `json:"player"`
            Wins   int    `json:"wins"`
        }
        var leaderboard []Leader
        if err == nil {
            defer leaderRows.Close()
            for leaderRows.Next() {
                var l Leader
                if err := leaderRows.Scan(&l.Player, &l.Wins); err != nil {
                    continue
                }
                leaderboard = append(leaderboard, l)
            }
        }

        c.JSON(http.StatusOK, gin.H{
            "players":           playerCount,
            "matches":           matchCount,
            "recent_matches":    recent,
            "most_active":       mostActive,
            "most_wins":         mostWins,
            "most_common_score": map[string]int{"a": commonScoreA, "b": commonScoreB, "count": freq},
            "biggest_win":       map[string]interface{}{"margin": margin, "winner": winner, "loser": loser},
            "average_score":     avgScore,
            "leaderboard":       leaderboard,
        })
    }
}