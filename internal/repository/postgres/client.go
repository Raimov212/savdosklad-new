package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"savdosklad/internal/entity"
)

type ClientRepo struct {
	db *sql.DB
}

func NewClientRepo(db *sql.DB) *ClientRepo {
	return &ClientRepo{db: db}
}

func (r *ClientRepo) Create(c *entity.Client) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO clients ("businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt") 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		c.BusinessID, c.FullName, c.Phone, c.Address, c.TelegramUserID, c.Language, time.Now(), time.Now(),
	).Scan(&id)
	return id, err
}

func (r *ClientRepo) GetByID(id int) (*entity.Client, error) {
	var c entity.Client
	err := r.db.QueryRow(
		`SELECT id, "businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt" 
		 FROM clients WHERE id = $1`, id,
	).Scan(&c.ID, &c.BusinessID, &c.FullName, &c.Phone, &c.Address, &c.TelegramUserID, &c.Language, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ClientRepo) GetByBusinessID(businessID int) ([]entity.Client, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt" 
		 FROM clients WHERE "businessId" = $1 ORDER BY id`, businessID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Client
	for rows.Next() {
		var c entity.Client
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.FullName, &c.Phone, &c.Address, &c.TelegramUserID, &c.Language, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *ClientRepo) GetByTelegramID(tgID int64) ([]entity.Client, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt" 
		 FROM clients WHERE "telegramUserId" = $1`, tgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Client
	for rows.Next() {
		var c entity.Client
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.FullName, &c.Phone, &c.Address, &c.TelegramUserID, &c.Language, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *ClientRepo) GetByPhoneNumber(phone string) ([]entity.Client, error) {
	rows, err := r.db.Query(
		`SELECT id, "businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt" 
		 FROM clients WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')`, phone,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []entity.Client
	for rows.Next() {
		var c entity.Client
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.FullName, &c.Phone, &c.Address, &c.TelegramUserID, &c.Language, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *ClientRepo) Search(bid int, query string) ([]entity.Client, error) {
	cleanQuery := ""
	for _, char := range query {
		if char >= '0' && char <= '9' {
			cleanQuery += string(char)
		}
	}

	sqlQuery := `SELECT id, "businessId", "fullName", phone, address, "telegramUserId", language, "createdAt", "updatedAt" 
		 FROM clients 
		 WHERE "businessId" = $1 AND ("fullName" ILIKE $2`

	args := []interface{}{bid, "%" + query + "%"}

	if cleanQuery != "" {
		sqlQuery += ` OR regexp_replace(phone, '[^0-9]', '', 'g') ILIKE $3`
		args = append(args, "%"+cleanQuery+"%")
	}
	sqlQuery += `)`

	rows, err := r.db.Query(sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []entity.Client
	for rows.Next() {
		var c entity.Client
		if err := rows.Scan(&c.ID, &c.BusinessID, &c.FullName, &c.Phone, &c.Address, &c.TelegramUserID, &c.Language, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		results = append(results, c)
	}
	return results, nil
}

func (r *ClientRepo) GetTotalDebt(clientID int) (float64, error) {
	var total sql.NullFloat64
	err := r.db.QueryRow(`SELECT SUM(debt) FROM total_transactions WHERE "clientId" = $1`, clientID).Scan(&total)
	return total.Float64, err
}

func (r *ClientRepo) Update(id int, req entity.UpdateClientRequest) error {
	query := `UPDATE clients SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.FullName != nil {
		query += fmt.Sprintf(`, "fullName" = $%d`, argIdx)
		args = append(args, *req.FullName)
		argIdx++
	}
	if req.Phone != nil {
		query += fmt.Sprintf(`, phone = $%d`, argIdx)
		args = append(args, *req.Phone)
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

func (r *ClientRepo) UpdateTelegramID(id int, tgID int64) error {
	_, err := r.db.Exec(`UPDATE clients SET "telegramUserId" = $1, "updatedAt" = $2 WHERE id = $3`, tgID, time.Now(), id)
	return err
}

func (r *ClientRepo) UpdateLanguage(id int, lang string) error {
	_, err := r.db.Exec(`UPDATE clients SET language = $1, "updatedAt" = $2 WHERE id = $3`, lang, time.Now(), id)
	return err
}

func (r *ClientRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM clients WHERE id = $1`, id)
	return err
}
