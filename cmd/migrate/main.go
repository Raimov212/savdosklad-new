package main

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"

	"savdosklad/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := sql.Open("postgres", cfg.DB.DSN())
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer db.Close()

	migrations := []string{
		"migrations/000022_create_marketplace_categories.up.sql",
		"migrations/000023_create_marketplace_products.up.sql",
		"migrations/000024_update_cart_items_reference.up.sql",
		"migrations/000032_create_organizations.up.sql",
	}

	for _, m := range migrations {
		data, err := os.ReadFile(m)
		if err != nil {
			log.Fatalf("Failed to read %s: %v", m, err)
		}
		_, err = db.Exec(string(data))
		if err != nil {
			log.Printf("WARNING: %s: %v", m, err)
		} else {
			log.Printf("OK: %s", m)
		}
	}
	log.Println("Migrations complete!")
}
