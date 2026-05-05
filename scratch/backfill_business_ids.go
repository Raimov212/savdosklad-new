package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found or error loading it, proceeding with environment variables")
	}

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	dbSsl := os.Getenv("DB_SSLMODE")

	connStr := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s", dbUser, dbPass, dbHost, dbPort, dbName, dbSsl)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// 1. Backfill businessId in marketplace_products from products
	fmt.Println("Backfilling businessId in marketplace_products...")
	res, err := db.Exec(`
		UPDATE marketplace_products mp
		SET "businessId" = p."businessId"
		FROM products p
		WHERE mp."productId" = p.id AND mp."businessId" IS NULL
	`)
	if err != nil {
		log.Printf("Error backfilling marketplace_products: %v", err)
	} else {
		affected, _ := res.RowsAffected()
		fmt.Printf("Updated %d products in marketplace_products\n", affected)
	}

	// 2. Backfill businessId in orders from order_items -> marketplace_products
	fmt.Println("Backfilling businessId in orders...")
	res, err = db.Exec(`
		UPDATE orders o
		SET "businessId" = mp."businessId"
		FROM order_items oi
		JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
		WHERE o.id = oi."orderId" AND o."businessId" IS NULL AND mp."businessId" IS NOT NULL
	`)
	if err != nil {
		log.Printf("Error backfilling orders: %v", err)
	} else {
		affected, _ := res.RowsAffected()
		fmt.Printf("Updated %d orders\n", affected)
	}

	fmt.Println("Database backfill completed.")
}
