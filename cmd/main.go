package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"savdosklad/config"
	_ "savdosklad/docs"
	"savdosklad/internal/entity"
	"savdosklad/internal/handler"
	"savdosklad/internal/middleware"
	"savdosklad/internal/notifier"
	"savdosklad/internal/repository/postgres"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/database"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title SavdoSklad API
// @version 1.0
// @description SavdoSklad biznes boshqaruv tizimi API hujjatlari
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

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
	categoryRepo := postgres.NewCategoryRepo(db)
	productRepo := postgres.NewProductRepo(db)
	clientRepo := postgres.NewClientRepo(db)
	transactionRepo := postgres.NewTransactionRepo(db)
	refundRepo := postgres.NewRefundRepo(db)
	expenseRepo := postgres.NewExpenseRepo(db)
	moneyRepo := postgres.NewMoneyRepo(db)
	calculationRepo := postgres.NewCalculationRepo(db)

	// Brand management and RBAC updates
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "brandName" VARCHAR(255);`)
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "brandImage" TEXT;`)
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "image" TEXT;`)
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'uz';`)
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "marketId" INTEGER;`)
	_, _ = db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdBy" INTEGER;`)

	// Junction table for multiple businesses per user (especially employees)
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS user_businesses (
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
		PRIMARY KEY (user_id, business_id)
	);`)

	// Migrate existing marketId to user_businesses if not exists
	_, _ = db.Exec(`INSERT INTO user_businesses (user_id, business_id) 
		SELECT id, "marketId" FROM users WHERE "marketId" IS NOT NULL 
		ON CONFLICT DO NOTHING;`)

	// Make marketplace_categories.categoryId optional (not linked to system categories)
	_, _ = db.Exec(`ALTER TABLE marketplace_categories ALTER COLUMN "categoryId" DROP NOT NULL;`)
	_, _ = db.Exec(`DO $$ BEGIN
		IF EXISTS (
			SELECT 1 FROM information_schema.table_constraints
			WHERE table_name = 'marketplace_categories'
			AND constraint_type = 'FOREIGN KEY'
		) THEN
			ALTER TABLE marketplace_categories DROP CONSTRAINT IF EXISTS marketplace_categories_categoryId_fkey;
		END IF;
	END $$;`)

	// Make marketplace_products.productId optional (standalone products)
	_, _ = db.Exec(`ALTER TABLE marketplace_products ALTER COLUMN "productId" DROP NOT NULL;`)
	_, _ = db.Exec(`ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_products_productId_fkey;`)

	// Add businessId column to marketplace_products for direct business tracking
	_, _ = db.Exec(`ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS "businessId" INTEGER REFERENCES businesses(id) ON DELETE SET NULL;`)

	// Tracking who created the records
	_, _ = db.Exec(`ALTER TABLE total_transactions ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);`)
	_, _ = db.Exec(`ALTER TABLE total_refunds ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);`)
	_, _ = db.Exec(`ALTER TABLE total_expenses ADD COLUMN IF NOT EXISTS "createdBy" INTEGER REFERENCES users(id);`)

	// Region repository
	regionRepo := postgres.NewRegionRepo(db)

	// Marketplace repositories
	customerRepo := postgres.NewCustomerRepo(db)
	addressRepo := postgres.NewAddressRepo(db)
	cartRepo := postgres.NewCartRepo(db)
	marketplaceRepo := postgres.NewMarketplaceRepo(db)
	marketplaceAdminRepo := postgres.NewMarketplaceAdminRepo(db)

	var tgNotifier *notifier.TelegramNotifier
	if cfg.Telegram.Token != "" {
		tgNotifier, _ = notifier.NewTelegramNotifier(cfg.Telegram.Token, userRepo, businessRepo)
	}
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

	// Admin-related
	regionUC := usecase.NewRegionUseCase(regionRepo)

	// Marketplace use cases
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
	geoH := handler.NewGeographyHandler(regionUC)

	// Router
	router := gin.Default()
	router.Use(middleware.CORS())
	router.Use(middleware.Language())
	router.Static("/images", "./images")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api/v1")
	{
		// Public
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", userH.Register)
			authGroup.POST("/login", userH.Login)
		}

		// Geography (Public)
		geoGroup := api.Group("/geography")
		{
			geoGroup.GET("/regions", geoH.GetRegions)
			geoGroup.GET("/districts", geoH.GetDistricts)
			geoGroup.GET("/markets", geoH.GetMarkets)
		}

		// Upload (Public for Register)
		api.POST("/upload", uploadH.Upload)

		// Protected
		protected := api.Group("")
		protected.Use(middleware.JWTAuth(jwtManager))
		protected.Use(middleware.SubscriptionCheck(userRepo))
		{
			handler.RegisterRoutes(protected, userH, businessH, categoryH, productH, clientH, transactionH, refundH, expenseH, moneyH, calculationH)

			// Excel
			excel := protected.Group("/excel")
			{
				excel.GET("/categories/export", excelH.ExportCategories)
				excel.POST("/categories/import", excelH.ImportCategories)
				excel.GET("/products/export", excelH.ExportProducts)
				excel.POST("/products/import", excelH.ImportProducts)
				excel.GET("/categories/template", excelH.CategoryTemplate)
				excel.GET("/products/template", excelH.ProductTemplate)
			}

			// Upload
			// moved back to public api.POST("/upload", uploadH.Upload) in api.Group

			// Admin
			admin := protected.Group("/admin")
			admin.Use(handler.SuperAdminOnly())
			{
				admin.GET("/users", adminH.GetAllUsers)
				admin.PUT("/users/:id", adminH.UpdateUser)
				admin.DELETE("/users/:id", adminH.DeleteUser)
				admin.POST("/users/extend", adminH.ExtendSubscription)

				// Geography (Admin)
				admin.POST("/regions", adminH.CreateRegion)
				admin.GET("/regions", adminH.GetRegions)
				admin.PUT("/regions/:id", adminH.UpdateRegion)
				admin.DELETE("/regions/:id", adminH.DeleteRegion)

				admin.POST("/districts", adminH.CreateDistrict)
				admin.GET("/districts", adminH.GetDistricts)
				admin.PUT("/districts/:id", adminH.UpdateDistrict)
				admin.DELETE("/districts/:id", adminH.DeleteDistrict)

				admin.POST("/markets", adminH.CreateMarket)
				admin.GET("/markets", adminH.GetMarkets)
				admin.PUT("/markets/:id", adminH.UpdateMarket)
				admin.DELETE("/markets/:id", adminH.DeleteMarket)
			}

			// Marketplace Admin
			adminMp := protected.Group("/admin/marketplace")
			{
				adminMp.GET("/products", marketplaceAdminH.GetProducts)
				adminMp.POST("/products", marketplaceAdminH.CreateProduct)
				adminMp.PUT("/products/:id", marketplaceAdminH.UpdateProduct)
				adminMp.DELETE("/products/:id", marketplaceAdminH.DeleteProduct)

				adminMp.GET("/categories", marketplaceAdminH.GetCategories)
				adminMp.POST("/categories", marketplaceAdminH.CreateCategory)
				adminMp.PUT("/categories/:id", marketplaceAdminH.UpdateCategory)
				adminMp.DELETE("/categories/:id", marketplaceAdminH.DeleteCategory)
			}
		}

		// Marketplace (Public)
		mp := api.Group("/marketplace")
		{
			mp.GET("/products", marketplaceH.GetProducts)
			mp.GET("/products/:id", marketplaceH.GetProductByID)
			mp.GET("/categories", marketplaceH.GetCategories)
			mp.GET("/businesses", marketplaceH.GetBusinesses)

			// Add Geography to Marketplace too
			mp.GET("/regions", geoH.GetRegions)
			mp.GET("/districts", geoH.GetDistricts)
			mp.GET("/markets", geoH.GetMarkets)

			// Customer auth
			mpAuth := mp.Group("/auth")
			{
				mpAuth.POST("/register", customerH.Register)
				mpAuth.POST("/login", customerH.Login)
			}
		}
	}

	port := cfg.Server.Port
	if port == "" {
		port = "8080"
	}
	// Ensure Super Admin exists
	ensureSuperAdmin(userRepo)

	log.Printf("Server starting on port %s...", port)
	log.Fatal(router.Run(fmt.Sprintf(":%s", port)))
}

func ensureSuperAdmin(repo *postgres.UserRepo) {
	username := "admin"
	existing, _ := repo.GetByUsername(username)
	if existing != nil {
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("adminpassword"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash super admin password: %v", err)
		return
	}

	superAdmin := &entity.User{
		FirstName:      "System",
		LastName:       "Admin",
		UserName:       username,
		Password:       string(hashedPassword),
		Role:           entity.RoleSuperAdmin,
		IsVerified:     true,
		IsExpired:      false,
		Language:       "uz",
		ExpirationDate: time.Now().AddDate(100, 0, 0),
	}

	_, err = repo.Create(superAdmin)
	if err != nil {
		log.Printf("Failed to create default super admin: %v", err)
	} else {
		log.Printf("Default super admin created: %s / adminpassword", username)
	}
}
