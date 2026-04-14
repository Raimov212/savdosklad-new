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

	// 1. Get all regions
	rows, _ := db.Query(`SELECT id, name FROM regions ORDER BY id`)
	fmt.Println("REGIONS AND DISTRICTS:")
	for rows.Next() {
		var id int
		var name string
		rows.Scan(&id, &name)

		var count int
		db.QueryRow(`SELECT count(*) FROM districts WHERE "regionId" = $1`, id).Scan(&count)
		fmt.Printf("ID: %v, Name: %v, Districts: %v\n", id, name, count)
	}
}
