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

	var businessId sql.NullInt64
	var businessName sql.NullString
	err = db.QueryRow(`
		SELECT o."businessId", b.name 
		FROM orders o 
		LEFT JOIN businesses b ON o."businessId" = b.id 
		WHERE o.id = 2
	`).Scan(&businessId, &businessName)
	
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Order #2 Business ID: %v, Name: %s\n", businessId.Int64, businessName.String)
}
