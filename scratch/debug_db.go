package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "host=localhost port=5432 user=postgres password=my_strong_password_123 dbname=savdosklad sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	fmt.Println("--- ORDERS TABLE ---")
	rows, err := db.Query(`SELECT id, "customerId", "businessId", status, "totalSum" FROM orders`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id, cid int
		var bid sql.NullInt64
		var status string
		var totalSum float64
		if err := rows.Scan(&id, &cid, &bid, &status, &totalSum); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("ID: %d, CustomerID: %d, BusinessID: %v, Status: %s, Total: %.2f\n", id, cid, bid.Int64, status, totalSum)
	}
}
