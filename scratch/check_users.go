package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

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

	rows, err := db.Query(`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt" FROM users ORDER BY id`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id int
			firstName, lastName, userName, password string
			phoneNumber, inviterCode, offerCode, image, brandName, brandImage *string
			role int
			isVerified, isExpired bool
			tgID sql.NullInt64
			lang sql.NullString
			marketId, createdBy *int
			expDate sql.NullTime
			createdAt, updatedAt time.Time
		)

		err := rows.Scan(
			&id, &firstName, &lastName, &phoneNumber, &userName, &password,
			&role, &inviterCode, &offerCode, &isVerified, &isExpired,
			&image, &brandName, &brandImage, &tgID, &lang, &marketId, &createdBy, &expDate, &createdAt, &updatedAt,
		)
		if err != nil {
			fmt.Printf("XATO Topildi! ID: %d da muammo bor. Xato: %v\n", id, err)
			continue
		}
		fmt.Printf("User ID: %d Muvaffaqiyatli o'qildi!\n", id)
	}
	fmt.Println("Tekshiruv tugadi.")
}
