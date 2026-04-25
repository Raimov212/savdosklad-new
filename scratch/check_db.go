package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgres://postgres:postgres@localhost:5432/savdosklad?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query(`
		SELECT b.name, c.month, c.year, c.profit, c."totalIncome" 
		FROM calculations c 
		JOIN businesses b ON c."businessId" = b.id 
		WHERE c.month = 4 AND c.year = 2026
	`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	found := false
	for rows.Next() {
		var name string
		var m, y int
		var profit, income float64
		if err := rows.Scan(&name, &m, &y, &profit, &income); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Business: %s, Period: %d/%d, Income: %f, Profit: %f\n", name, m, y, income, profit)
		found = true
	}

	if !found {
		fmt.Println("No April 2026 reports found in database.")
	}
}
