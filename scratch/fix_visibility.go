package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgresql://postgres:postgres@localhost:5432/savdosklad?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Make sure at least one product is visible and has quantity
	res, err := db.Exec(`UPDATE marketplace_products SET "isVisible" = TRUE, quantity = 10 WHERE id = (SELECT id FROM marketplace_products LIMIT 1)`)
	if err != nil {
		log.Fatal(err)
	}
	rowsAffected, _ := res.RowsAffected()
	fmt.Printf("Updated %d products to be visible\n", rowsAffected)
}
