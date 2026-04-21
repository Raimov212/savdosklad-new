package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"

	"savdosklad/internal/entity"
)

type ProductRepo struct {
	db *sql.DB
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{db: db}
}

func (r *ProductRepo) Create(p *entity.Product) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO products (name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
		p.Name, p.LokalCode, p.ShortDescription, p.FullDescription, p.Price, p.Discount, p.Quantity,
		p.Images, p.Barcode, p.Country, p.CategoryID, p.BusinessID, false, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ProductRepo) GetByID(id int) (*entity.Product, error) {
	var p entity.Product
	err := r.db.QueryRow(
		`SELECT id, name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt"
		FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
		&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepo) GetByBusinessID(businessID int) ([]entity.Product, error) {
	rows, err := r.db.Query(
		`SELECT id, name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt"
		FROM products WHERE "businessId" = $1 AND "isDeleted" = false ORDER BY id`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) GetByCategoryID(categoryID int) ([]entity.Product, error) {
	rows, err := r.db.Query(
		`SELECT id, name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt"
		FROM products WHERE "categoryId" = $1 AND "isDeleted" = false ORDER BY id`, categoryID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) Update(id int, req entity.UpdateProductRequest) error {
	query := `UPDATE products SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.LokalCode != nil {
		query += fmt.Sprintf(`, "lokalCode" = $%d`, argIdx)
		args = append(args, *req.LokalCode)
		argIdx++
	}
	if req.ShortDescription != nil {
		query += fmt.Sprintf(`, "shortDescription" = $%d`, argIdx)
		args = append(args, *req.ShortDescription)
		argIdx++
	}
	if req.FullDescription != nil {
		query += fmt.Sprintf(`, "fullDescription" = $%d`, argIdx)
		args = append(args, *req.FullDescription)
		argIdx++
	}
	if req.Price != nil {
		query += fmt.Sprintf(`, price = $%d`, argIdx)
		args = append(args, *req.Price)
		argIdx++
	}
	if req.Discount != nil {
		query += fmt.Sprintf(`, discount = $%d`, argIdx)
		args = append(args, *req.Discount)
		argIdx++
	}
	if req.Quantity != nil {
		query += fmt.Sprintf(`, quantity = $%d`, argIdx)
		args = append(args, *req.Quantity)
		argIdx++
	}
	if req.Images != nil {
		query += fmt.Sprintf(`, images = $%d`, argIdx)
		args = append(args, *req.Images)
		argIdx++
	}
	if req.Barcode != nil {
		query += fmt.Sprintf(`, barcode = $%d`, argIdx)
		args = append(args, *req.Barcode)
		argIdx++
	}
	if req.Country != nil {
		query += fmt.Sprintf(`, country = $%d`, argIdx)
		args = append(args, *req.Country)
		argIdx++
	}
	if req.CategoryID != nil {
		query += fmt.Sprintf(`, "categoryId" = $%d`, argIdx)
		args = append(args, *req.CategoryID)
		argIdx++
	}
	if req.IsDeleted != nil {
		query += fmt.Sprintf(`, "isDeleted" = $%d`, argIdx)
		args = append(args, *req.IsDeleted)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *ProductRepo) Delete(id int) error {
	_, err := r.db.Exec(`UPDATE products SET "isDeleted" = true, "updatedAt" = $1 WHERE id = $2`, time.Now(), id)
	return err
}

func (r *ProductRepo) BulkDelete(bid int, categoryId *int, productIds []int) error {
	if len(productIds) > 0 {
		_, err := r.db.Exec(`UPDATE products SET "isDeleted" = true, "updatedAt" = $1 WHERE "businessId" = $2 AND id = ANY($3)`, time.Now(), bid, pq.Array(productIds))
		return err
	}

	query := `UPDATE products SET "isDeleted" = true, "updatedAt" = $1 WHERE "businessId" = $2 AND "isDeleted" = false`
	args := []interface{}{time.Now(), bid}

	if categoryId != nil && *categoryId > 0 {
		query += ` AND "categoryId" = $3`
		args = append(args, *categoryId)
	}

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *ProductRepo) Search(bid int, query string) ([]entity.Product, error) {
	rows, err := r.db.Query(
		`SELECT id, name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt"
		FROM products
		WHERE "businessId" = $1 AND "isDeleted" = false
		AND (name ILIKE $2 OR barcode ILIKE $3 OR "lokalCode" ILIKE $4)
		ORDER BY name`,
		bid, "%"+query+"%", "%"+query+"%", "%"+query+"%",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) GetByUserID(userID int) ([]entity.Product, error) {
	rows, err := r.db.Query(
		`SELECT p.id, p.name, p."lokalCode", p."shortDescription", p."fullDescription", p.price, p.discount, p.quantity, p.images, p.barcode, p.country, p."categoryId", p."businessId", p."isDeleted", p."createdAt", p."updatedAt"
		FROM products p
		WHERE p."businessId" IN (
			SELECT id FROM businesses WHERE "userId" = $1
			UNION
			SELECT business_id FROM user_businesses WHERE user_id = $1
		) AND p."isDeleted" = false
		ORDER BY p.name`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) SearchByUserID(userID int, query string) ([]entity.Product, error) {
	rows, err := r.db.Query(
		`SELECT p.id, p.name, p."lokalCode", p."shortDescription", p."fullDescription", p.price, p.discount, p.quantity, p.images, p.barcode, p.country, p."categoryId", p."businessId", p."isDeleted", p."createdAt", p."updatedAt"
		FROM products p
		WHERE p."businessId" IN (
			SELECT id FROM businesses WHERE "userId" = $1
			UNION
			SELECT business_id FROM user_businesses WHERE user_id = $1
		) AND p."isDeleted" = false
		AND (p.name ILIKE $2 OR p.barcode ILIKE $3 OR p."lokalCode" ILIKE $4)
		ORDER BY p.name`,
		userID, "%"+query+"%", "%"+query+"%", "%"+query+"%",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) GetByIDs(ids []int) ([]entity.Product, error) {
	fmt.Printf("GetByIDs query with: %v\n", ids)
	rows, err := r.db.Query(
		`SELECT id, name, "lokalCode", "shortDescription", "fullDescription", price, discount, quantity, images, barcode, country, "categoryId", "businessId", "isDeleted", "createdAt", "updatedAt"
		FROM products WHERE id = ANY($1) AND "isDeleted" = false ORDER BY id`, pq.Array(ids),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Product
	for rows.Next() {
		var p entity.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.LokalCode, &p.ShortDescription, &p.FullDescription, &p.Price, &p.Discount, &p.Quantity,
			&p.Images, &p.Barcode, &p.Country, &p.CategoryID, &p.BusinessID, &p.IsDeleted, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *ProductRepo) CreateBulkDeleteRequest(req *entity.BulkDeleteRequest) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO bulk_delete_requests (business_id, category_id, product_ids, created_by, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		req.BusinessID, req.CategoryID, req.ProductIDs, req.CreatedBy, "pending", time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ProductRepo) GetBulkDeleteRequests() ([]entity.BulkDeleteRequest, error) {
	rows, err := r.db.Query(`
		SELECT 
			r.id, r.business_id, r.category_id, r.product_ids, r.created_by, r.status, r.created_at, r.updated_at,
			COALESCE(b.name, ''),
			COALESCE(c.name, '--')
		FROM bulk_delete_requests r
		LEFT JOIN businesses b ON r.business_id = b.id
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.status = 'pending' 
		ORDER BY r.id DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.BulkDeleteRequest
	for rows.Next() {
		var req entity.BulkDeleteRequest
		if err := rows.Scan(
			&req.ID, &req.BusinessID, &req.CategoryID, &req.ProductIDs, &req.CreatedBy, &req.Status, &req.CreatedAt, &req.UpdatedAt,
			&req.BusinessName, &req.CategoryName,
		); err != nil {
			return nil, err
		}
		list = append(list, req)
	}
	return list, nil
}

func (r *ProductRepo) UpdateBulkDeleteRequestStatus(id int, status string) error {
	_, err := r.db.Exec(`UPDATE bulk_delete_requests SET status = $1, updated_at = $2 WHERE id = $3`, status, time.Now(), id)
	return err
}
