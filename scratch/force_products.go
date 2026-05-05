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

	res, err := db.Exec(`UPDATE marketplace_products SET "isVisible" = TRUE, quantity = 100`)
	if err != nil {
		log.Fatal(err)
	}
	rowsAffected, _ := res.RowsAffected()
	fmt.Printf("Updated %d products\n", rowsAffected)
}
