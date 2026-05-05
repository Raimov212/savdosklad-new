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

	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM marketplace_products WHERE "isVisible" = TRUE AND quantity > 0`).Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Visible products count: %d\n", count)

	rows, err := db.Query(`SELECT id, name, "isVisible", quantity FROM marketplace_products`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("All products in marketplace:")
	for rows.Next() {
		var id, quantity int
		var name string
		var isVisible bool
		rows.Scan(&id, &name, &isVisible, &quantity)
		fmt.Printf("ID: %d, Name: %s, Visible: %v, Qty: %d\n", id, name, isVisible, quantity)
	}
}
