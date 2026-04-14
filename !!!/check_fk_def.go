package main

import (
	"fmt"
	"log"
	"savdosklad/config"
	"savdosklad/pkg/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.NewPostgresDB(cfg.DB)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var definition string
	err = db.QueryRow(`
		SELECT pg_get_constraintdef(oid) 
		FROM pg_constraint 
		WHERE conname = 'businesses_marketId_fkey'
	`).Scan(&definition)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Foreign key definition: %s\n", definition)
}
