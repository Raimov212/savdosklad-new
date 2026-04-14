package main

import (
	"fmt"
	"log"
	"math/rand"
	"savdosklad/config"
	"savdosklad/pkg/database"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Config load error: %v", err)
	}

	db, err := database.NewPostgresDB(cfg.DB)
	if err != nil {
		log.Fatalf("DB connect error: %v", err)
	}
	defer db.Close()

	fmt.Println("🚀 Demo ma'lumotlarni yuklash boshlandi...")

	// 1. Demo User
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("demo123"), bcrypt.DefaultCost)
	var userID int
	err = db.QueryRow(`
		INSERT INTO users ("userName", password, "firstName", "lastName", role, "isVerified", language, "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT ("userName") DO UPDATE SET "userName" = EXCLUDED."userName" RETURNING id`,
		"demo_user", string(hashedPassword), "Demo", "Foydalanuvchi", 1, true, "uz", time.Now(), time.Now(),
	).Scan(&userID)
	if err != nil {
		log.Fatalf("User creation error: %v", err)
	}

	// 2. Demo Businesses
	businesses := []string{"Savdo Markazi", "Texno Sklad", "Oziq-ovqat Do'koni"}
	var bizIDs []int
	for _, bName := range businesses {
		var bID int
		err = db.QueryRow(`
			INSERT INTO businesses ("userId", name, description, balance, "createdAt", "updatedAt")
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
			userID, bName, bName+" demo tavsifi", 1000000.0, time.Now(), time.Now(),
		).Scan(&bID)
		if err == nil {
			bizIDs = append(bizIDs, bID)
		}
	}

	// 3. Demo Categories and Products
	products := []struct {
		name     string
		price    float64
		buyPrice float64
	}{
		{"Noutbuk HP", 7500000, 6800000},
		{"Sichqoncha", 120000, 80000},
		{"Klaviatura", 350000, 250000},
		{"Monitor 24'", 1800000, 1500000},
		{"Telefon S23", 9500000, 8800000},
		{"Quloqchin", 450000, 300000},
	}

	for _, bID := range bizIDs {
		var catID int
		db.QueryRow(`INSERT INTO categories ("businessId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4) RETURNING id`,
			bID, "Elektronika", time.Now(), time.Now()).Scan(&catID)

		for _, p := range products {
			db.Exec(`INSERT INTO products ("businessId", "categoryId", name, price, "buyPrice", quantity, "minQuantity", "createdAt", "updatedAt")
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
				bID, catID, p.name, p.price, p.buyPrice, 100, 10, time.Now(), time.Now())
		}
	}

	// 4. Demo Clients
	var clientIDs []int
	for i := 1; i <= 5; i++ {
		var cID int
		db.QueryRow(`INSERT INTO clients ("businessId", "fullName", phone, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
			bizIDs[0], fmt.Sprintf("Mijoz %d", i), fmt.Sprintf("+99890123456%d", i), time.Now(), time.Now()).Scan(&cID)
		clientIDs = append(clientIDs, cID)
	}

	// 5. Demo Transactions (Last 30 days)
	fmt.Println("📊 30 kunlik savdo tarixi yaratilmoqda...")
	for d := 30; d >= 0; d-- {
		dayDate := time.Now().AddDate(0, 0, -d)
		numSales := rand.Intn(5) + 1
		for i := 0; i < numSales; i++ {
			total := float64((rand.Intn(10) + 1) * 50000)
			cash := total
			if rand.Intn(2) == 0 {
				cash = total * 0.5
			}
			card := total - cash
			
			// Create Total Transaction
			var tID int
			db.QueryRow(`INSERT INTO total_transactions ("businessId", "userId", "clientId", total, cash, card, click, debt, "createdAt", "updatedAt")
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
				bizIDs[0], userID, clientIDs[rand.Intn(len(clientIDs))], total, cash, card, 0, 0, dayDate, dayDate).Scan(&tID)
		}
	}

	fmt.Println("✅ Demo ma'lumotlar muvaffaqiyatli yuklandi!")
	fmt.Println("🔑 Login: demo_user")
	fmt.Println("🔑 Parol: demo123")
}
