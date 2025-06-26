package main

import (
	"log"
	"net/http"
	"strconv"
	"tttracker/models"
	"tttracker/storage"

	"github.com/gin-gonic/gin"
)

func main() {
	db := storage.Open("database.db")
	defer db.Close()

	router := gin.Default()

	router.NoRoute(func(c *gin.Context) {
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
			return
		}
		c.File("./frontend/build/index.html")
	})

	api := router.Group("/api")
	{
		api.GET("/players", func(c *gin.Context) {
			players, err := models.GetAllPlayers(db)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch players"})
				return
			}
			c.JSON(http.StatusOK, players)
		})
		api.GET("/matches", func(c *gin.Context) {
			matches, err := models.GetAllMatches(db)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
				return
			}
			c.JSON(http.StatusOK, matches)
		})
		api.POST("/players", func(c *gin.Context) {
			var player models.Player
			if err := c.ShouldBindJSON(&player); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			id, err := models.CreatePlayer(db, player.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create player"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{"id": id})
		})
		api.POST("/matches", func(c *gin.Context) {
			var match models.Match
			if err := c.ShouldBindJSON(&match); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			id, err := models.CreateMatch(db, match.PlayerA, match.PlayerB, match.ScoreA, match.ScoreB)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{"id": id})
		})
		api.GET("/players/:id", func(c *gin.Context) {
			id := c.Param("id")
			playerID, _ := strconv.Atoi(id)
			player, err := models.GetPlayerByID(db, playerID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch player"})
				return
			}
			if player == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
				return
			}
			c.JSON(http.StatusOK, player)
		})
		api.GET("/matches/:id", func(c *gin.Context) {
			id := c.Param("id")
			matchID, _ := strconv.Atoi(id)
			match, err := models.GetMatchByID(db, matchID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch match"})
				return
			}
			if match == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
				return
			}
			c.JSON(http.StatusOK, match)
		})
		api.DELETE("/players/:id", func(c *gin.Context) {
			id := c.Param("id")
			playerID, _ := strconv.Atoi(id)
			// Check if player exists before deleting
			player, err := models.GetPlayerByID(db, playerID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch player"})
				return
			}
			if player == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
				return
			}
			if err := models.DeletePlayer(db, playerID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete player"})
				return
			}
			c.Status(http.StatusNoContent)
		})
		api.DELETE("/matches/:id", func(c *gin.Context) {
			id := c.Param("id")
			matchID, _ := strconv.Atoi(id)
			// Check if match exists before deleting
			match, err := models.GetMatchByID(db, matchID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch match"})
				return
			}
			if match == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
				return
			}
			if err := models.DeleteMatch(db, matchID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete match"})
				return
			}
			c.Status(http.StatusNoContent)
		})
	}

	// Define a simple GET endpoint
	router.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})

	// Start the server on port 8080
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
