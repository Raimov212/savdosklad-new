package postgres

import (
	"database/sql"
	"fmt"
	"strings"

	"savdosklad/internal/entity"
)

type MarketplaceRepo struct {
	db *sql.DB
}

func NewMarketplaceRepo(db *sql.DB) *MarketplaceRepo {
	return &MarketplaceRepo{db: db}
}

type ProductFilter struct {
	Search     string
	CategoryID int // marketplace_categories.id
	MinPrice   float64
	MaxPrice   float64
	SortBy     string // "price_asc", "price_desc", "newest", "name"
	Page       int
	Limit      int
}

// GetPublicProducts — marketplace_products dan faqat isVisible=true mahsulotlarni olish
func (r *MarketplaceRepo) GetPublicProducts(filter ProductFilter) ([]entity.MarketplaceProduct, int, error) {
	whereClauses := []string{`"isVisible" = TRUE`, `quantity > 0`}
	args := []interface{}{}
	argIndex := 1

	if filter.Search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf(`(LOWER(name) LIKE LOWER($%d) OR LOWER("shortDescription") LIKE LOWER($%d))`, argIndex, argIndex))
		args = append(args, "%"+filter.Search+"%")
		argIndex++
	}
	if filter.CategoryID > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf(`"marketplaceCategoryId" = $%d`, argIndex))
		args = append(args, filter.CategoryID)
		argIndex++
	}
	if filter.MinPrice > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf(`price >= $%d`, argIndex))
		args = append(args, filter.MinPrice)
		argIndex++
	}
	if filter.MaxPrice > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf(`price <= $%d`, argIndex))
		args = append(args, filter.MaxPrice)
		argIndex++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	// Count total
	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM marketplace_products WHERE %s`, whereSQL)
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Sort
	orderBy := `"createdAt" DESC`
	switch filter.SortBy {
	case "price_asc":
		orderBy = "price ASC"
	case "price_desc":
		orderBy = "price DESC"
	case "name":
		orderBy = "name ASC"
	case "newest":
		orderBy = `"createdAt" DESC`
	}

	// Pagination
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.Limit

	query := fmt.Sprintf(`SELECT id, "productId", "marketplaceCategoryId", name, "shortDescription", "fullDescription",
		price, discount, quantity, images, "isVisible", "createdAt", "updatedAt"
		FROM marketplace_products WHERE %s ORDER BY %s LIMIT $%d OFFSET $%d`,
		whereSQL, orderBy, argIndex, argIndex+1)
	args = append(args, filter.Limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []entity.MarketplaceProduct
	for rows.Next() {
		var p entity.MarketplaceProduct
		if err := rows.Scan(
			&p.ID, &p.ProductID, &p.MarketplaceCategoryID, &p.Name, &p.ShortDescription, &p.FullDescription,
			&p.Price, &p.Discount, &p.Quantity, &p.Images, &p.IsVisible, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}

	return products, total, nil
}

func (r *MarketplaceRepo) GetProductByID(id int) (*entity.MarketplaceProduct, error) {
	p := &entity.MarketplaceProduct{}
	query := `SELECT id, "productId", "marketplaceCategoryId", name, "shortDescription", "fullDescription",
		price, discount, quantity, images, "isVisible", "createdAt", "updatedAt"
		FROM marketplace_products WHERE id = $1 AND "isVisible" = TRUE`
	err := r.db.QueryRow(query, id).Scan(
		&p.ID, &p.ProductID, &p.MarketplaceCategoryID, &p.Name, &p.ShortDescription, &p.FullDescription,
		&p.Price, &p.Discount, &p.Quantity, &p.Images, &p.IsVisible, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// GetCategories — faqat ko'rinadigan marketplace kategoriyalarni olish
func (r *MarketplaceRepo) GetCategories() ([]entity.MarketplaceCategory, error) {
	query := `SELECT id, "categoryId", name, image, "isVisible", "createdAt", "updatedAt"
		FROM marketplace_categories WHERE "isVisible" = TRUE ORDER BY name`
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

func (r *MarketplaceRepo) GetBusinesses() ([]entity.Business, error) {
	query := `SELECT id, "userId", name, description, "businessAccountNumber", balance, image, "createdAt", "updatedAt"
		FROM businesses ORDER BY name`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var businesses []entity.Business
	for rows.Next() {
		var b entity.Business
		if err := rows.Scan(&b.ID, &b.UserID, &b.Name, &b.Description, &b.BusinessAccountNumber,
			&b.Balance, &b.Image, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, err
		}
		businesses = append(businesses, b)
	}
	return businesses, nil
}
