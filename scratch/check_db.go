package main

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"os"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/savdosklad?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}

	// Check user businesses
	fmt.Println("--- User Businesses ---")
	rows, _ := db.Query(`SELECT user_id, business_id FROM user_businesses`)
	for rows.Next() {
		var uid, bid int
		rows.Scan(&uid, &bid)
		fmt.Printf("User: %d, Business: %d\n", uid, bid)
	}

	// Check users marketId
	fmt.Println("\n--- Users marketId ---")
	rows, _ = db.Query(`SELECT id, "userName", role, "marketId" FROM users`)
	for rows.Next() {
		var id, role int
		var username string
		var mid sql.NullInt64
		rows.Scan(&id, &username, &role, &mid)
		fmt.Printf("ID: %d, User: %s, Role: %d, MarketID: %v\n", id, username, role, mid.Int64)
	}
}
