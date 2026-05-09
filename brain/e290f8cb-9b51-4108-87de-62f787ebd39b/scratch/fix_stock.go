package main

import (
	"database/sql"
	"fmt"
	"log"
	_ "github.com/lib/pq"
)

func main() {
	connStr := "user=postgres dbname=savdosklad sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 1. Identify refunds made before the fix was applied (approx 19:15:00)
	fixTime := "2026-05-09 19:15:00"

	query := `
		UPDATE products p
		SET quantity = p.quantity + sub.total_refunded
		FROM (
			SELECT "productId", SUM("productQuantity") as total_refunded
			FROM refunds
			WHERE "createdAt" < $1
			GROUP BY "productId"
		) sub
		WHERE p.id = sub."productId"
	`

	res, err := db.Exec(query, fixTime)
	if err != nil {
		log.Fatal(err)
	}

	rows, _ := res.RowsAffected()
	fmt.Printf("Muvaffaqiyatli: %d ta mahsulotning ombor qoldig'i to'g'rilandi.\n", rows)
}
