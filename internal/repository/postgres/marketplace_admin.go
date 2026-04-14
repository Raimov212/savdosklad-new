package postgres

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"savdosklad/internal/entity"
)

type MarketplaceAdminRepo struct {
	db *sql.DB
}

func NewMarketplaceAdminRepo(db *sql.DB) *MarketplaceAdminRepo {
	return &MarketplaceAdminRepo{db: db}
}

// ==================== CATEGORIES ====================

func (r *MarketplaceAdminRepo) CreateCategory(req *entity.CreateMarketplaceCategoryRequest) (*entity.MarketplaceCategory, error) {
	cat := &entity.MarketplaceCategory{}
	var image *string
	if req.Image != "" {
		image = &req.Image
	}
	query := `INSERT INTO marketplace_categories ("categoryId", name, image)
		VALUES ($1, $2, $3)
		RETURNING id, "categoryId", name, image, "isVisible", "createdAt", "updatedAt"`
	// req.CategoryID is *int — pass nil to SQL when not provided
	err := r.db.QueryRow(query, req.CategoryID, req.Name, image).
		Scan(&cat.ID, &cat.CategoryID, &cat.Name, &cat.Image, &cat.IsVisible, &cat.CreatedAt, &cat.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return cat, nil
}

func (r *MarketplaceAdminRepo) GetAllCategories() ([]entity.MarketplaceCategory, error) {
	query := `SELECT id, "categoryId", name, image, "isVisible", "createdAt", "updatedAt"
		FROM marketplace_categories ORDER BY "createdAt" DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []entity.MarketplaceCategory
	for rows.Next() {
		var c entity.MarketplaceCategory
		if err := rows.Scan(&c.ID, &c.CategoryID, &c.Name, &c.Image, &c.IsVisible, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func (r *MarketplaceAdminRepo) GetCategoryByID(id int) (*entity.MarketplaceCategory, error) {
	cat := &entity.MarketplaceCategory{}
	query := `SELECT id, "categoryId", name, image, "isVisible", "createdAt", "updatedAt"
		FROM marketplace_categories WHERE id = $1`
	err := r.db.QueryRow(query, id).
		Scan(&cat.ID, &cat.CategoryID, &cat.Name, &cat.Image, &cat.IsVisible, &cat.CreatedAt, &cat.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return cat, nil
}

func (r *MarketplaceAdminRepo) UpdateCategory(id int, req *entity.UpdateMarketplaceCategoryRequest) error {
	setClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf(`name = $%d`, argIdx))
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Image != nil {
		setClauses = append(setClauses, fmt.Sprintf(`image = $%d`, argIdx))
		args = append(args, *req.Image)
		argIdx++
	}
	if req.IsVisible != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"isVisible" = $%d`, argIdx))
		args = append(args, *req.IsVisible)
		argIdx++
	}

	if len(setClauses) == 0 {
		return nil
	}

	setClauses = append(setClauses, fmt.Sprintf(`"updatedAt" = $%d`, argIdx))
	args = append(args, time.Now())
	argIdx++

	args = append(args, id)
	query := fmt.Sprintf(`UPDATE marketplace_categories SET %s WHERE id = $%d`,
		strings.Join(setClauses, ", "), argIdx)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *MarketplaceAdminRepo) DeleteCategory(id int) error {
	_, err := r.db.Exec(`DELETE FROM marketplace_categories WHERE id = $1`, id)
	return err
}

// ==================== PRODUCTS ====================

func (r *MarketplaceAdminRepo) CreateProduct(req *entity.CreateMarketplaceProductRequest) (*entity.MarketplaceProduct, error) {
	mp := &entity.MarketplaceProduct{}
	var shortDesc, fullDesc, images *string
	if req.ShortDescription != "" {
		shortDesc = &req.ShortDescription
	}
	if req.FullDescription != "" {
		fullDesc = &req.FullDescription
	}
	if req.Images != "" {
		images = &req.Images
	}

	if req.ProductID != nil {
		// Linked to a system product — deduct quantity
		tx, err := r.db.Begin()
		if err != nil {
			return nil, err
		}
		defer tx.Rollback()

		var currentQty int
		err = tx.QueryRow(`SELECT quantity FROM products WHERE id = $1`, *req.ProductID).Scan(&currentQty)
		if err != nil {
			return nil, fmt.Errorf("product not found: %w", err)
		}
		if currentQty < req.Quantity {
			return nil, fmt.Errorf("insufficient quantity: available %d, requested %d", currentQty, req.Quantity)
		}
		_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1, "updatedAt" = NOW() WHERE id = $2`,
			req.Quantity, *req.ProductID)
		if err != nil {
			return nil, err
		}

		query := `INSERT INTO marketplace_products
			("productId", "businessId", "marketplaceCategoryId", name, "shortDescription", "fullDescription", price, discount, quantity, images)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			RETURNING id, "productId", "businessId", "marketplaceCategoryId", name, "shortDescription", "fullDescription",
				price, discount, quantity, images, "isVisible", "createdAt", "updatedAt"`
		err = tx.QueryRow(query,
			req.ProductID, req.BusinessID, req.MarketplaceCategoryID, req.Name, shortDesc, fullDesc,
			req.Price, req.Discount, req.Quantity, images,
		).Scan(
			&mp.ID, &mp.ProductID, &mp.BusinessID, &mp.MarketplaceCategoryID, &mp.Name, &mp.ShortDescription, &mp.FullDescription,
			&mp.Price, &mp.Discount, &mp.Quantity, &mp.Images, &mp.IsVisible, &mp.CreatedAt, &mp.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		// Populate business name for the returned object
		err = tx.QueryRow(`
			SELECT COALESCE(biz.name, '') as business_name
			FROM products p
			LEFT JOIN businesses biz ON p."businessId" = biz.id
			WHERE p.id = $1`, *req.ProductID).Scan(&mp.BusinessName)
		if err != nil {
			return nil, err
		}
		if err := tx.Commit(); err != nil {
			return nil, err
		}
	} else {
		// Standalone marketplace product — no inventory link
		query := `INSERT INTO marketplace_products
			("productId", "businessId", "marketplaceCategoryId", name, "shortDescription", "fullDescription", price, discount, quantity, images)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			RETURNING id, "productId", "businessId", "marketplaceCategoryId", name, "shortDescription", "fullDescription",
				price, discount, quantity, images, "isVisible", "createdAt", "updatedAt"`
		err := r.db.QueryRow(query,
			nil, req.BusinessID, req.MarketplaceCategoryID, req.Name, shortDesc, fullDesc,
			req.Price, req.Discount, req.Quantity, images,
		).Scan(
			&mp.ID, &mp.ProductID, &mp.BusinessID, &mp.MarketplaceCategoryID, &mp.Name, &mp.ShortDescription, &mp.FullDescription,
			&mp.Price, &mp.Discount, &mp.Quantity, &mp.Images, &mp.IsVisible, &mp.CreatedAt, &mp.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		// Populate business name from businessId
		if req.BusinessID != nil {
			_ = r.db.QueryRow(`SELECT COALESCE(name, '') FROM businesses WHERE id = $1`, *req.BusinessID).Scan(&mp.BusinessName)
		}
	}
	return mp, nil
}

func (r *MarketplaceAdminRepo) GetAllProducts() ([]entity.MarketplaceProduct, error) {
	query := `SELECT mp.id, mp."productId", mp."businessId", mp."marketplaceCategoryId", mp.name, mp."shortDescription", mp."fullDescription",
		mp.price, mp.discount, mp.quantity, mp.images, mp."isVisible", mp."createdAt", mp."updatedAt",
		COALESCE(biz_direct.name, biz_product.name, '') as business_name
		FROM marketplace_products mp
		LEFT JOIN businesses biz_direct ON mp."businessId" = biz_direct.id
		LEFT JOIN products p ON mp."productId" = p.id
		LEFT JOIN businesses biz_product ON p."businessId" = biz_product.id
		ORDER BY mp."createdAt" DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []entity.MarketplaceProduct
	for rows.Next() {
		var p entity.MarketplaceProduct
		if err := rows.Scan(
			&p.ID, &p.ProductID, &p.BusinessID, &p.MarketplaceCategoryID, &p.Name, &p.ShortDescription, &p.FullDescription,
			&p.Price, &p.Discount, &p.Quantity, &p.Images, &p.IsVisible, &p.CreatedAt, &p.UpdatedAt,
			&p.BusinessName,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

func (r *MarketplaceAdminRepo) GetProductByID(id int) (*entity.MarketplaceProduct, error) {
	mp := &entity.MarketplaceProduct{}
	query := `SELECT mp.id, mp."productId", mp."businessId", mp."marketplaceCategoryId", mp.name, mp."shortDescription", mp."fullDescription",
		mp.price, mp.discount, mp.quantity, mp.images, mp."isVisible", mp."createdAt", mp."updatedAt",
		COALESCE(biz_direct.name, biz_product.name, '') as business_name
		FROM marketplace_products mp
		LEFT JOIN businesses biz_direct ON mp."businessId" = biz_direct.id
		LEFT JOIN products p ON mp."productId" = p.id
		LEFT JOIN businesses biz_product ON p."businessId" = biz_product.id
		WHERE mp.id = $1`
	err := r.db.QueryRow(query, id).Scan(
		&mp.ID, &mp.ProductID, &mp.BusinessID, &mp.MarketplaceCategoryID, &mp.Name, &mp.ShortDescription, &mp.FullDescription,
		&mp.Price, &mp.Discount, &mp.Quantity, &mp.Images, &mp.IsVisible, &mp.CreatedAt, &mp.UpdatedAt,
		&mp.BusinessName,
	)
	if err != nil {
		return nil, err
	}
	return mp, nil
}

func (r *MarketplaceAdminRepo) UpdateProduct(id int, req *entity.UpdateMarketplaceProductRequest) error {
	setClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	if req.MarketplaceCategoryID != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"marketplaceCategoryId" = $%d`, argIdx))
		args = append(args, *req.MarketplaceCategoryID)
		argIdx++
	}
	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf(`name = $%d`, argIdx))
		args = append(args, *req.Name)
		argIdx++
	}
	if req.ShortDescription != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"shortDescription" = $%d`, argIdx))
		args = append(args, *req.ShortDescription)
		argIdx++
	}
	if req.FullDescription != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"fullDescription" = $%d`, argIdx))
		args = append(args, *req.FullDescription)
		argIdx++
	}
	if req.Price != nil {
		setClauses = append(setClauses, fmt.Sprintf(`price = $%d`, argIdx))
		args = append(args, *req.Price)
		argIdx++
	}
	if req.Discount != nil {
		setClauses = append(setClauses, fmt.Sprintf(`discount = $%d`, argIdx))
		args = append(args, *req.Discount)
		argIdx++
	}
	if req.Images != nil {
		setClauses = append(setClauses, fmt.Sprintf(`images = $%d`, argIdx))
		args = append(args, *req.Images)
		argIdx++
	}
	if req.IsVisible != nil {
		setClauses = append(setClauses, fmt.Sprintf(`"isVisible" = $%d`, argIdx))
		args = append(args, *req.IsVisible)
		argIdx++
	}

	if len(setClauses) == 0 && req.Quantity == nil {
		return nil
	}

	setClauses = append(setClauses, fmt.Sprintf(`"updatedAt" = $%d`, argIdx))
	args = append(args, time.Now())
	argIdx++

	args = append(args, id)
	query := fmt.Sprintf(`UPDATE marketplace_products SET %s WHERE id = $%d`,
		strings.Join(setClauses, ", "), argIdx)

	_, err := r.db.Exec(query, args...)
	return err
}

// UpdateProductQuantity — miqdor o'zgarganda inventar sinxronizatsiya
func (r *MarketplaceAdminRepo) UpdateProductQuantity(id int, newQuantity int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Hozirgi marketplace miqdorini olish
	var currentMpQty int
	var productID int
	err = tx.QueryRow(`SELECT quantity, "productId" FROM marketplace_products WHERE id = $1`, id).
		Scan(&currentMpQty, &productID)
	if err != nil {
		return err
	}

	diff := newQuantity - currentMpQty // musbat = ko'paytirish, manfiy = kamaytirish

	if diff > 0 {
		// Ko'proq kerak — asosiy jadvaldan olish
		var availableQty int
		err = tx.QueryRow(`SELECT quantity FROM products WHERE id = $1`, productID).Scan(&availableQty)
		if err != nil {
			return err
		}
		if availableQty < diff {
			return fmt.Errorf("insufficient quantity: available %d, requested %d more", availableQty, diff)
		}
		_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1, "updatedAt" = NOW() WHERE id = $2`,
			diff, productID)
	} else if diff < 0 {
		// Kamaydi — asosiy jadvalga qaytarish
		_, err = tx.Exec(`UPDATE products SET quantity = quantity + $1, "updatedAt" = NOW() WHERE id = $2`,
			-diff, productID)
	}
	if err != nil {
		return err
	}

	// Marketplace mahsulot miqdorini yangilash
	_, err = tx.Exec(`UPDATE marketplace_products SET quantity = $1, "updatedAt" = NOW() WHERE id = $2`,
		newQuantity, id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// DeleteProduct — o'chirganda miqdorni asosiy jadvalga qaytarish
func (r *MarketplaceAdminRepo) DeleteProduct(id int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Marketplace mahsulotning ma'lumotlarini olish
	var qty int
	var productID int
	err = tx.QueryRow(`SELECT quantity, "productId" FROM marketplace_products WHERE id = $1`, id).
		Scan(&qty, &productID)
	if err != nil {
		return err
	}

	// Miqdorni asosiy jadvalga qaytarish
	if qty > 0 {
		_, err = tx.Exec(`UPDATE products SET quantity = quantity + $1, "updatedAt" = NOW() WHERE id = $2`,
			qty, productID)
		if err != nil {
			return err
		}
	}

	// Marketplace mahsulotni o'chirish
	_, err = tx.Exec(`DELETE FROM marketplace_products WHERE id = $1`, id)
	if err != nil {
		return err
	}

	return tx.Commit()
}
