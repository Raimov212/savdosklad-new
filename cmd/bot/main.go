package main

import (
	"log"
	"savdosklad/config"
	"savdosklad/internal/notifier"
	"savdosklad/internal/repository/postgres"
	"savdosklad/internal/telegram"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Database
	db, err := database.NewPostgresDB(cfg.DB)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// JWT
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpirationHours)

	// Repositories
	userRepo := postgres.NewUserRepo(db)
	businessRepo := postgres.NewBusinessRepo(db)
	productRepo := postgres.NewProductRepo(db)
	transactionRepo := postgres.NewTransactionRepo(db)
	refundRepo := postgres.NewRefundRepo(db)
	expenseRepo := postgres.NewExpenseRepo(db)
	clientRepo := postgres.NewClientRepo(db)

	// Notifier
	tgNotifier, _ := notifier.NewTelegramNotifier(cfg.Telegram.Token, userRepo, businessRepo)

	// Use cases
	userUC := usecase.NewUserUseCase(userRepo, jwtManager)
	businessUC := usecase.NewBusinessUseCase(businessRepo)
	productUC := usecase.NewProductUseCase(productRepo)
	transactionUC := usecase.NewTransactionUseCase(transactionRepo, clientRepo, nil)
	refundUC := usecase.NewRefundUseCase(refundRepo, tgNotifier)
	expenseUC := usecase.NewExpenseUseCase(expenseRepo, tgNotifier)
	clientUC := usecase.NewClientUseCase(clientRepo, userRepo)

	// Bot
	tgBot, err := telegram.NewBot(cfg.Telegram, userUC, businessUC, productUC, transactionUC, refundUC, expenseUC, clientUC)
	if err != nil {
		log.Fatalf("Failed to create bot: %v", err)
	}

	// Kunlik hisobotlar uchun rejalashtiruvchini (Ticker/Goroutine) ishga tushirish.
	tgBot.RunScheduler()
	// Botni xabarlarni qabul qilish (Channel) rejimida ishga tushirish.
	tgBot.Start()
}
