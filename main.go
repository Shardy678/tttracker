package main

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"tttracker/models"
	"tttracker/storage"

	"tttracker/handlers"

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

	router.Static("/assets", "./frontend/build/assets")

	api := router.Group("/api")
	{
		api.GET("/players", func(c *gin.Context) {
			players, err := models.GetAllPlayers(db)
			if err != nil {
				log.Printf("GetAllPlayers error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch players"})
				return
			}
			c.JSON(http.StatusOK, players)
		})

		api.GET("/matches", func(c *gin.Context) {
			matches, err := models.GetAllMatches(db)
			if err != nil {
				log.Printf("GetAllMatches error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
				return
			}
			c.JSON(http.StatusOK, matches)
		})

		api.POST("/players", func(c *gin.Context) {
			var input struct {
				Name string `json:"name"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				log.Printf("CreatePlayer: invalid input JSON: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			createdPlayer, err := models.CreatePlayer(db, input.Name)
			if err != nil {
				log.Printf("CreatePlayer error: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusCreated, createdPlayer)
		})

		api.POST("/matches", func(c *gin.Context) {
			var match models.Match
			if err := c.ShouldBindJSON(&match); err != nil {
				log.Printf("CreateMatch: invalid input JSON: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
				return
			}
			log.Printf("Creating match: playerAID=%d, playerBID=%d, scoreA=%d, scoreB=%d", match.PlayerAID, match.PlayerBID, match.ScoreA, match.ScoreB)
			id, err := models.CreateMatch(db, match.PlayerAID, match.PlayerBID, match.ScoreA, match.ScoreB)
			if err != nil {
				log.Printf("CreateMatch error: %v", err)
				if strings.Contains(err.Error(), "does not exist") || strings.Contains(err.Error(), "invalid input") {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match"})
				}
				return
			}
			log.Printf("Match created: id=%d", id)
			c.JSON(http.StatusCreated, gin.H{"id": id})
		})

		api.GET("/players/:id", func(c *gin.Context) {
			id := c.Param("id")
			playerID, _ := strconv.Atoi(id)
			player, err := models.GetPlayerByID(db, playerID)
			if err != nil {
				log.Printf("GetPlayerByID error: %v", err)
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
				log.Printf("GetMatchByID error: %v", err)
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
			player, err := models.GetPlayerByID(db, playerID)
			if err != nil {
				log.Printf("GetPlayerByID error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch player"})
				return
			}
			if player == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
				return
			}
			if err := models.DeletePlayer(db, playerID); err != nil {
				log.Printf("DeletePlayer error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete player"})
				return
			}
			c.Status(http.StatusNoContent)
		})

		api.DELETE("/matches/:id", func(c *gin.Context) {
			id := c.Param("id")
			matchID, _ := strconv.Atoi(id)
			match, err := models.GetMatchByID(db, matchID)
			if err != nil {
				log.Printf("GetMatchByID error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch match"})
				return
			}
			if match == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
				return
			}
			if err := models.DeleteMatch(db, matchID); err != nil {
				log.Printf("DeleteMatch error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete match"})
				return
			}
			c.Status(http.StatusNoContent)
		})

		api.GET("/stats", handlers.GetStats(db))
	}

	router.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
