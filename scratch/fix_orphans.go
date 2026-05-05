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
	godotenv.Load(".env")
	connStr := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s", 
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), 
		os.Getenv("DB_PORT"), os.Getenv("DB_NAME"), os.Getenv("DB_SSLMODE"))

	db, err := sql.Open("postgres", connStr)
	if err != nil { log.Fatal(err) }
	defer db.Close()

	// Yetim qolgan barcha mahsulotlarni 28-IDli biznesga biriktiramiz
	fmt.Println("Yetim mahsulotlarga biznes biriktirilmoqda...")
	res, err := db.Exec(`UPDATE marketplace_products SET "businessId" = 28 WHERE "businessId" IS NULL`)
	if err != nil {
		log.Println("Xato (products):", err)
	} else {
		affected, _ := res.RowsAffected()
		fmt.Printf("%d ta mahsulotga biznes biriktirildi.\n", affected)
	}

	// Yetim qolgan barcha buyurtmalarni ichidagi mahsulotining biznesiga moslaymiz
	fmt.Println("Yetim buyurtmalarga biznes biriktirilmoqda...")
	res, err = db.Exec(`
		UPDATE orders o
		SET "businessId" = mp."businessId"
		FROM order_items oi
		JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
		WHERE o.id = oi."orderId" AND o."businessId" IS NULL AND mp."businessId" IS NOT NULL
	`)
	if err != nil {
		log.Println("Xato (orders):", err)
	} else {
		affected, _ := res.RowsAffected()
		fmt.Printf("%d ta buyurtmaga biznes biriktirildi.\n", affected)
	}
}
