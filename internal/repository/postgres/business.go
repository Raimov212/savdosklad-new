package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"savdosklad/internal/entity"
)

type BusinessRepo struct {
	db *sql.DB
}

func NewBusinessRepo(db *sql.DB) *BusinessRepo {
	return &BusinessRepo{db: db}
}

func (r *BusinessRepo) Create(b *entity.Business) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO businesses ("userId", name, description, "businessAccountNumber", balance, image, "regionId", "districtId", "marketId", address, "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
		b.UserID, b.Name, b.Description, b.BusinessAccountNumber, b.Balance, b.Image, b.RegionID, b.DistrictID, b.MarketID, b.Address, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *BusinessRepo) GetByID(id int) (*entity.Business, error) {
	var b entity.Business
	err := r.db.QueryRow(
		`SELECT b.id, b."userId", b.name, b.description, b."businessAccountNumber", b.balance, b.image, 
		        b."regionId", b."districtId", b."marketId", b.address, b."createdAt", b."updatedAt",
		        COALESCE(r.name, '') as region_name, COALESCE(d.name, '') as district_name, COALESCE(m.name, '') as market_name
		FROM businesses b
		LEFT JOIN regions r ON b."regionId" = r.id
		LEFT JOIN districts d ON b."districtId" = d.id
		LEFT JOIN markets m ON b."marketId" = m.id
		WHERE b.id = $1`, id,
	).Scan(&b.ID, &b.UserID, &b.Name, &b.Description, &b.BusinessAccountNumber, &b.Balance, &b.Image,
		&b.RegionID, &b.DistrictID, &b.MarketID, &b.Address, &b.CreatedAt, &b.UpdatedAt,
		&b.RegionName, &b.DistrictName, &b.MarketName)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *BusinessRepo) GetByUserID(userID int) ([]entity.Business, error) {
	rows, err := r.db.Query(
		`SELECT b.id, b."userId", b.name, b.description, b."businessAccountNumber", b.balance, b.image, 
		        b."regionId", b."districtId", b."marketId", b.address, b."createdAt", b."updatedAt",
		        COALESCE(r.name, '') as region_name, COALESCE(d.name, '') as district_name, COALESCE(m.name, '') as market_name
		FROM businesses b
		LEFT JOIN regions r ON b."regionId" = r.id
		LEFT JOIN districts d ON b."districtId" = d.id
		LEFT JOIN markets m ON b."marketId" = m.id
		WHERE b."userId" = $1 
		   OR b.id IN (SELECT business_id FROM user_businesses WHERE user_id = $1)
		   OR b.id = (SELECT "marketId" FROM users WHERE id = $1)
		ORDER BY b.id`, userID,
	)
	if err != nil {
		log.Printf("[Repo] GetByUserID query error for %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	var list []entity.Business
	for rows.Next() {
		var b entity.Business
		if err := rows.Scan(&b.ID, &b.UserID, &b.Name, &b.Description, &b.BusinessAccountNumber, &b.Balance, &b.Image,
			&b.RegionID, &b.DistrictID, &b.MarketID, &b.Address, &b.CreatedAt, &b.UpdatedAt,
			&b.RegionName, &b.DistrictName, &b.MarketName); err != nil {
			log.Printf("[Repo] GetByUserID scan error for %d: %v", userID, err)
			return nil, err
		}
		list = append(list, b)
	}
	log.Printf("[Repo] GetByUserID returned %d businesses for %d", len(list), userID)
	return list, nil
}

func (r *BusinessRepo) GetAll() ([]entity.Business, error) {
	rows, err := r.db.Query(
		`SELECT b.id, b."userId", b.name, b.description, b."businessAccountNumber", b.balance, b.image, 
		        b."regionId", b."districtId", b."marketId", b.address, b."createdAt", b."updatedAt",
		        COALESCE(r.name, '') as region_name, COALESCE(d.name, '') as district_name, COALESCE(m.name, '') as market_name
		FROM businesses b
		LEFT JOIN regions r ON b."regionId" = r.id
		LEFT JOIN districts d ON b."districtId" = d.id
		LEFT JOIN markets m ON b."marketId" = m.id
		ORDER BY b.id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Business
	for rows.Next() {
		var b entity.Business
		if err := rows.Scan(&b.ID, &b.UserID, &b.Name, &b.Description, &b.BusinessAccountNumber, &b.Balance, &b.Image,
			&b.RegionID, &b.DistrictID, &b.MarketID, &b.Address, &b.CreatedAt, &b.UpdatedAt,
			&b.RegionName, &b.DistrictName, &b.MarketName); err != nil {
			return nil, err
		}
		list = append(list, b)
	}
	return list, nil
}

func (r *BusinessRepo) Update(id int, req entity.UpdateBusinessRequest) error {
	query := `UPDATE businesses SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.Name != nil {
		query += fmt.Sprintf(`, name = $%d`, argIdx)
		args = append(args, *req.Name)
		argIdx++
	}
	if req.Description != nil {
		query += fmt.Sprintf(`, description = $%d`, argIdx)
		args = append(args, *req.Description)
		argIdx++
	}
	if req.BusinessAccountNumber != nil {
		query += fmt.Sprintf(`, "businessAccountNumber" = $%d`, argIdx)
		args = append(args, *req.BusinessAccountNumber)
		argIdx++
	}
	if req.Balance != nil {
		query += fmt.Sprintf(`, balance = $%d`, argIdx)
		args = append(args, *req.Balance)
		argIdx++
	}
	if req.Image != nil {
		query += fmt.Sprintf(`, image = $%d`, argIdx)
		args = append(args, *req.Image)
		argIdx++
	}
	if req.RegionID != nil {
		query += fmt.Sprintf(`, "regionId" = $%d`, argIdx)
		args = append(args, *req.RegionID)
		argIdx++
	}
	if req.DistrictID != nil {
		query += fmt.Sprintf(`, "districtId" = $%d`, argIdx)
		args = append(args, *req.DistrictID)
		argIdx++
	}
	if req.MarketID != nil {
		query += fmt.Sprintf(`, "marketId" = $%d`, argIdx)
		args = append(args, *req.MarketID)
		argIdx++
	}
	if req.Address != nil {
		query += fmt.Sprintf(`, address = $%d`, argIdx)
		args = append(args, *req.Address)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	return err
}

func (r *BusinessRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM businesses WHERE id = $1`, id)
	return err
}
