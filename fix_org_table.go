package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	// .env faylingizdagi ma'lumotlar asosida ulanish
	connStr := "postgres://postgres:my_strong_password_123@localhost:5432/savdosklad?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	queries := []string{
		`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "regionId" INTEGER;`,
		`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "districtId" INTEGER;`,
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			log.Printf("Error executing query %s: %v", q, err)
		} else {
			fmt.Printf("Successfully executed: %s\n", q)
		}
	}
}
