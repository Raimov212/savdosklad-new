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

	rows, err := db.Query(`
		SELECT p.name, b.name as business_name
		FROM marketplace_products p
		JOIN businesses b ON p."businessId" = b.id
		WHERE p.name IN ('Readmi Note 14', 'Notbukka sumkasi')
	`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Products and their businesses:")
	for rows.Next() {
		var pName, bName string
		rows.Scan(&pName, &bName)
		fmt.Printf("Product: %s, Business: %s\n", pName, bName)
	}
}
