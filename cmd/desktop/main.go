package main

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	webview2 "github.com/jchv/go-webview2"
	_ "github.com/lib/pq"

	"savdosklad/config"
	"savdosklad/internal/handler"
	"savdosklad/internal/middleware"
	"savdosklad/internal/notifier"
	"savdosklad/internal/repository/postgres"
	"savdosklad/internal/telegram"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/auth"
	cronpkg "savdosklad/pkg/cron"
	"savdosklad/pkg/database"

	_ "savdosklad/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//go:embed all:frontend
var frontendFS embed.FS

//go:embed all:migrations
var migrationsFS embed.FS

// @title SavdoSklad Desktop API
// @version 1.0
// @description SavdoSklad Desktop biznes boshqaruv tizimi API hujjatlari
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	// Fix for the 21-second delay in WebView2 caused by proxy auto-detection (WPAD)
	os.Setenv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--no-proxy-server")

	// ==================== BACKEND SERVER ====================
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

	// Auto-migrate database
	if err := runMigrations(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// JWT
	jwtManager := auth.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpirationHours)

	// Notifier (Initialize synchronously but with internal 5s timeout)
	tgNotifier, _ := notifier.NewTelegramNotifier(cfg.Telegram.Token, postgres.NewUserRepo(db), postgres.NewBusinessRepo(db))

	// Repositories
	userRepo := postgres.NewUserRepo(db)
	businessRepo := postgres.NewBusinessRepo(db)
	categoryRepo := postgres.NewCategoryRepo(db)
	productRepo := postgres.NewProductRepo(db)
	clientRepo := postgres.NewClientRepo(db)
	transactionRepo := postgres.NewTransactionRepo(db)
	refundRepo := postgres.NewRefundRepo(db)
	expenseRepo := postgres.NewExpenseRepo(db)
	moneyRepo := postgres.NewMoneyRepo(db)
	calculationRepo := postgres.NewCalculationRepo(db)
	regionRepo := postgres.NewRegionRepo(db)
	customerRepo := postgres.NewCustomerRepo(db)
	addressRepo := postgres.NewAddressRepo(db)
	cartRepo := postgres.NewCartRepo(db)
	marketplaceRepo := postgres.NewMarketplaceRepo(db)
	marketplaceAdminRepo := postgres.NewMarketplaceAdminRepo(db)

	// Use cases
	userUC := usecase.NewUserUseCase(userRepo, jwtManager)
	businessUC := usecase.NewBusinessUseCase(businessRepo)
	categoryUC := usecase.NewCategoryUseCase(categoryRepo)
	productUC := usecase.NewProductUseCase(productRepo)
	clientUC := usecase.NewClientUseCase(clientRepo, userRepo)
	transactionUC := usecase.NewTransactionUseCase(transactionRepo, clientRepo, tgNotifier)
	refundUC := usecase.NewRefundUseCase(refundRepo, tgNotifier)
	expenseUC := usecase.NewExpenseUseCase(expenseRepo, tgNotifier)
	moneyUC := usecase.NewMoneyUseCase(moneyRepo)
	calculationUC := usecase.NewCalculationUseCase(calculationRepo)
	regionUC := usecase.NewRegionUseCase(regionRepo)
	customerUC := usecase.NewCustomerUseCase(customerRepo, jwtManager)
	marketplaceUC := usecase.NewMarketplaceUseCase(marketplaceRepo, cartRepo, addressRepo)
	marketplaceAdminUC := usecase.NewMarketplaceAdminUseCase(marketplaceAdminRepo)

	// Handlers
	userH := handler.NewUserHandler(userUC)
	businessH := handler.NewBusinessHandler(businessUC)
	categoryH := handler.NewCategoryHandler(categoryUC)
	productH := handler.NewProductHandler(productUC)
	clientH := handler.NewClientHandler(clientUC)
	transactionH := handler.NewTransactionHandler(transactionUC)
	refundH := handler.NewRefundHandler(refundUC)
	expenseH := handler.NewExpenseHandler(expenseUC)
	moneyH := handler.NewMoneyHandler(moneyUC)
	calculationH := handler.NewCalculationHandler(calculationUC)
	excelH := handler.NewExcelHandler(productUC, categoryUC)
	uploadH := handler.NewUploadHandler()
	adminH := handler.NewAdminHandler(userUC, regionUC)
	customerH := handler.NewCustomerHandler(customerUC)
	marketplaceH := handler.NewMarketplaceHandler(marketplaceUC)
	marketplaceAdminH := handler.NewMarketplaceAdminHandler(marketplaceAdminUC)
	geographyH := handler.NewGeographyHandler(regionUC)

	// Router (release mode — no debug logs)
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(middleware.Language())
	router.Static("/images", "./images")

	// Swagger route
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API routes
	api := router.Group("/api/v1")
	{
		// Public routes
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", userH.Register)
			authGroup.POST("/login", userH.Login)
		}

		// Geography routes
		geography := api.Group("/geography")
		{
			geography.GET("/regions", geographyH.GetRegions)
			geography.GET("/districts", geographyH.GetDistricts)
			geography.GET("/markets", geographyH.GetMarkets)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.JWTAuth(jwtManager))
		protected.Use(middleware.SubscriptionCheck(userRepo))
		{
			handler.RegisterRoutes(protected, userH, businessH, categoryH, productH, clientH, transactionH, refundH, expenseH, moneyH, calculationH)

			// Excel import/export
			excel := protected.Group("/excel")
			{
				excel.GET("/categories/export", excelH.ExportCategories)
				excel.POST("/categories/import", excelH.ImportCategories)
				excel.GET("/products/export", excelH.ExportProducts)
				excel.POST("/products/import", excelH.ImportProducts)
				excel.GET("/categories/template", excelH.CategoryTemplate)
				excel.GET("/products/template", excelH.ProductTemplate)
			}

			// File upload
			protected.POST("/upload", uploadH.Upload)
		}

		// ==================== ADMIN PANEL (role=2) ====================
		adminPanel := protected.Group("/admin")
		adminPanel.Use(handler.SuperAdminOnly())
		{
			// User management
			adminPanel.GET("/users", adminH.GetAllUsers)
			adminPanel.PUT("/users/:id", adminH.UpdateUser)
			adminPanel.DELETE("/users/:id", adminH.DeleteUser)
			adminPanel.POST("/users/extend", adminH.ExtendSubscription)

			// Regions
			adminPanel.POST("/regions", adminH.CreateRegion)
			adminPanel.GET("/regions", adminH.GetRegions)
			adminPanel.PUT("/regions/:id", adminH.UpdateRegion)
			adminPanel.DELETE("/regions/:id", adminH.DeleteRegion)

			// Districts
			adminPanel.POST("/districts", adminH.CreateDistrict)
			adminPanel.GET("/districts", adminH.GetDistricts)
			adminPanel.PUT("/districts/:id", adminH.UpdateDistrict)
			adminPanel.DELETE("/districts/:id", adminH.DeleteDistrict)

			// Markets
			adminPanel.POST("/markets", adminH.CreateMarket)
			adminPanel.GET("/markets", adminH.GetMarkets)
			adminPanel.PUT("/markets/:id", adminH.UpdateMarket)
			adminPanel.DELETE("/markets/:id", adminH.DeleteMarket)
		}

		// Admin Marketplace
		adminMarketplace := protected.Group("/admin/marketplace")
		{
			adminMpCategories := adminMarketplace.Group("/categories")
			adminMpCategories.POST("", marketplaceAdminH.CreateCategory)
			adminMpCategories.GET("", marketplaceAdminH.GetCategories)
			adminMpCategories.GET("/:id", marketplaceAdminH.GetCategoryByID)
			adminMpCategories.PUT("/:id", marketplaceAdminH.UpdateCategory)
			adminMpCategories.DELETE("/:id", marketplaceAdminH.DeleteCategory)

			adminMpProducts := adminMarketplace.Group("/products")
			adminMpProducts.POST("", marketplaceAdminH.CreateProduct)
			adminMpProducts.GET("", marketplaceAdminH.GetProducts)
			adminMpProducts.GET("/:id", marketplaceAdminH.GetProductByID)
			adminMpProducts.PUT("/:id", marketplaceAdminH.UpdateProduct)
			adminMpProducts.DELETE("/:id", marketplaceAdminH.DeleteProduct)
		}

		// Marketplace
		marketplace := api.Group("/marketplace")
		{
			marketplace.GET("/products", marketplaceH.GetProducts)
			marketplace.GET("/products/:id", marketplaceH.GetProductByID)
			marketplace.GET("/categories", marketplaceH.GetCategories)
			marketplace.GET("/businesses", marketplaceH.GetBusinesses)

			customerAuth := marketplace.Group("/auth")
			{
				customerAuth.POST("/register", customerH.Register)
				customerAuth.POST("/login", customerH.Login)
			}

			customerProtected := marketplace.Group("")
			customerProtected.Use(middleware.CustomerAuth(jwtManager))
			{
				customerProtected.GET("/profile", customerH.GetProfile)
				customerProtected.PUT("/profile", customerH.UpdateProfile)

				customerProtected.GET("/cart", marketplaceH.GetCart)
				customerProtected.POST("/cart/items", marketplaceH.AddToCart)
				customerProtected.PUT("/cart/items/:id", marketplaceH.UpdateCartItem)
				customerProtected.DELETE("/cart/items/:id", marketplaceH.RemoveCartItem)

				customerProtected.POST("/addresses", marketplaceH.CreateAddress)
				customerProtected.GET("/addresses", marketplaceH.GetAddresses)
				customerProtected.PUT("/addresses/:id", marketplaceH.UpdateAddress)
				customerProtected.DELETE("/addresses/:id", marketplaceH.DeleteAddress)
			}
		}
	}

	// ==================== FRONTEND SERVE ====================
	// Serve embedded frontend files on non-API paths
	frontendSub, err := fs.Sub(frontendFS, "frontend")
	if err != nil {
		log.Fatalf("Could not access embedded frontend: %v", err)
	}
	router.NoRoute(gin.WrapH(http.FileServer(http.FS(frontendSub))))

	// ==================== CRON ====================
	scheduler := cronpkg.NewScheduler()
	setupCronJobs(scheduler, db)
	scheduler.Start()
	defer scheduler.Stop()

	// ==================== START ====================
	// Find a free port
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("Could not find free port: %v", err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	addr := fmt.Sprintf("127.0.0.1:%d", port)
	log.Printf("SavdoSklad Backend starting on http://%s", addr)

	// Start server in background
	go func() {
		if err := router.Run(addr); err != nil {
			log.Printf("Server error: %v", err)
		}
	}()

	// ==================== TELEGRAM BOT ====================
	go func() {
		bot, err := telegram.NewBot(
			cfg.Telegram,
			userUC,
			businessUC,
			productUC,
			transactionUC,
			refundUC,
			expenseUC,
			clientUC,
		)
		if err != nil {
			log.Printf("Telegram bot ishga tushmadi: %v", err)
			return
		}
		log.Println("Telegram bot ishga tushdi")
		bot.Start()
	}()

	// ==================== NATIVE WINDOW ====================
	// Use root "/" instead of "/index.html" to avoid 301 redirect
	appURL := fmt.Sprintf("http://%s/", addr)

	log.Println("Initializing WebView2 window...")
	w := webview2.New(false)
	if w == nil {
		log.Fatal("WebView2 runtime topilmadi. WebView2 Runtime o'rnatilganini tekshiring.")
	}
	defer w.Destroy()

	w.SetTitle("SavdoSklad — Biznes Boshqaruv Tizimi")
	w.SetSize(1600, 950, webview2.HintNone)

	log.Printf("Navigating to: %s", appURL)
	w.Navigate(appURL)

	log.Println("WebView2 loop starting...")
	w.Run()
}

func setupCronJobs(scheduler *cronpkg.Scheduler, db *sql.DB) {
	_ = scheduler.AddJob("0 0 * * *", func() {
		log.Println("Running daily subscription expiration check...")
		_, err := db.Exec(`UPDATE users SET "isExpired" = true WHERE "expirationDate" < NOW() AND "isExpired" = false`)
		if err != nil {
			log.Printf("Error in subscription check: %v", err)
		}
	})
}

func runMigrations(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS app_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("could not create app_migrations table: %w", err)
	}

	var oldMigrateVersion int64 = 0
	err = db.QueryRow(`SELECT version FROM schema_migrations LIMIT 1`).Scan(&oldMigrateVersion)
	if err != nil && err != sql.ErrNoRows {
		oldMigrateVersion = 0
	}

	rows, err := db.Query("SELECT version FROM app_migrations")
	if err != nil {
		return fmt.Errorf("could not fetch applied migrations: %w", err)
	}
	appliedMap := make(map[string]bool)
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err == nil {
			appliedMap[v] = true
		}
	}
	rows.Close()

	entries, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("could not read migrations directory: %w", err)
	}

	var upFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".up.sql") {
			upFiles = append(upFiles, entry.Name())
		}
	}
	sort.Strings(upFiles)

	applied := 0
	for _, filename := range upFiles {
		version := strings.TrimSuffix(filename, ".up.sql")
		if appliedMap[version] {
			continue
		}
		parts := strings.SplitN(version, "_", 2)
		if len(parts) > 0 {
			var numVersion int64
			fmt.Sscanf(parts[0], "%d", &numVersion)
			if numVersion > 0 && numVersion <= oldMigrateVersion {
				db.Exec("INSERT INTO app_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING", version)
				continue
			}
		}
		sqlBytes, err := fs.ReadFile(migrationsFS, "migrations/"+filename)
		if err != nil {
			return fmt.Errorf("could not read migration %s: %w", filename, err)
		}
		if _, err := db.Exec(string(sqlBytes)); err != nil {
			log.Printf("Warning: migration %s had error: %v", filename, err)
		}
		db.Exec("INSERT INTO app_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING", version)
		applied++
		log.Printf("Migration applied: %s", filename)
	}
	if applied > 0 {
		log.Printf("Migrations complete: %d new migration(s) applied", applied)
	}
	return nil
}
