package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"savdosklad/internal/entity"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(user *entity.User) (int, error) {
	var id int
	err := r.db.QueryRow(
		`INSERT INTO users ("firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id`,
		user.FirstName, user.LastName, user.PhoneNumber, user.UserName, user.Password,
		user.Role, user.InviterCode, user.OfferCode, user.IsVerified, user.IsExpired,
		user.Image, user.BrandName, user.BrandImage, user.TelegramUserID, user.Language, user.MarketID, user.CreatedBy, user.ExpirationDate, time.Now(), time.Now(),
	).Scan(&id)
	if err == nil && len(user.BusinessIDs) > 0 {
		_ = r.setBusinessIDs(id, user.BusinessIDs)
	}
	return id, err
}

func (r *UserRepo) GetByID(id int) (*entity.User, error) {
	var u entity.User
	err := r.db.QueryRow(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
		&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
		&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		log.Printf("[Repo] GetByID error for %d: %v", id, err)
		return nil, err
	}
	u.BusinessIDs, _ = r.getBusinessIDs(u.ID)
	return &u, nil
}

func (r *UserRepo) GetByUsername(username string) (*entity.User, error) {
	var u entity.User
	err := r.db.QueryRow(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users WHERE "userName" = $1`, username,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
		&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
		&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		log.Printf("[Repo] GetByUsername error for %s: %v", username, err)
		return nil, err
	}
	u.BusinessIDs, _ = r.getBusinessIDs(u.ID)
	return &u, nil
}

func (r *UserRepo) GetByTelegramID(tgID int64) (*entity.User, error) {
	var u entity.User
	err := r.db.QueryRow(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users WHERE "telegramUserId" = $1`, tgID,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
		&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
		&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByPhoneNumber(phone string) (*entity.User, error) {
	var u entity.User
	err := r.db.QueryRow(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users WHERE "phoneNumber" = $1`, phone,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
		&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
		&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetAll() ([]entity.User, error) {
	rows, err := r.db.Query(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users ORDER BY id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var u entity.User
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
			&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
			&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepo) Update(id int, req entity.UpdateUserRequest) error {
	query := `UPDATE users SET "updatedAt" = $1`
	args := []interface{}{time.Now()}
	argIdx := 2

	if req.FirstName != nil {
		query += fmt.Sprintf(`, "firstName" = $%d`, argIdx)
		args = append(args, *req.FirstName)
		argIdx++
	}
	if req.LastName != nil {
		query += fmt.Sprintf(`, "lastName" = $%d`, argIdx)
		args = append(args, *req.LastName)
		argIdx++
	}
	if req.PhoneNumber != nil {
		query += fmt.Sprintf(`, "phoneNumber" = $%d`, argIdx)
		args = append(args, *req.PhoneNumber)
		argIdx++
	}
	if req.Password != nil {
		query += fmt.Sprintf(`, password = $%d`, argIdx)
		args = append(args, *req.Password)
		argIdx++
	}
	if req.Role != nil {
		query += fmt.Sprintf(`, role = $%d`, argIdx)
		args = append(args, *req.Role)
		argIdx++
	}
	if req.IsVerified != nil {
		query += fmt.Sprintf(`, "isVerified" = $%d`, argIdx)
		args = append(args, *req.IsVerified)
		argIdx++
	}
	if req.IsExpired != nil {
		query += fmt.Sprintf(`, "isExpired" = $%d`, argIdx)
		args = append(args, *req.IsExpired)
		argIdx++
	}
	if req.Image != nil {
		query += fmt.Sprintf(`, image = $%d`, argIdx)
		args = append(args, *req.Image)
		argIdx++
	}
	if req.BrandName != nil {
		query += fmt.Sprintf(`, "brandName" = $%d`, argIdx)
		args = append(args, *req.BrandName)
		argIdx++
	}
	if req.BrandImage != nil {
		query += fmt.Sprintf(`, "brandImage" = $%d`, argIdx)
		args = append(args, *req.BrandImage)
		argIdx++
	}
	if req.MarketID != nil {
		query += fmt.Sprintf(`, "marketId" = $%d`, argIdx)
		args = append(args, *req.MarketID)
		argIdx++
	}
	if req.CreatedBy != nil {
		query += fmt.Sprintf(`, "createdBy" = $%d`, argIdx)
		args = append(args, *req.CreatedBy)
		argIdx++
	}
	if req.ExpirationDate != nil {
		query += fmt.Sprintf(`, "expirationDate" = $%d`, argIdx)
		args = append(args, *req.ExpirationDate)
		argIdx++
	}

	query += fmt.Sprintf(` WHERE id = $%d`, argIdx)
	args = append(args, id)

	_, err := r.db.Exec(query, args...)
	if err == nil && req.BusinessIDs != nil {
		_ = r.setBusinessIDs(id, req.BusinessIDs)
	}
	return err
}

func (r *UserRepo) UpdateTelegramID(id int, tgID int64) error {
	_, err := r.db.Exec(`UPDATE users SET "telegramUserId" = $1, "updatedAt" = $2 WHERE id = $3`, tgID, time.Now(), id)
	return err
}

func (r *UserRepo) UpdateLanguage(id int, lang string) error {
	_, err := r.db.Exec(`UPDATE users SET "language" = $1, "updatedAt" = $2 WHERE id = $3`, lang, time.Now(), id)
	return err
}

func (r *UserRepo) GetByCreatedBy(adminID int) ([]entity.User, error) {
	rows, err := r.db.Query(
		`SELECT id, "firstName", "lastName", "phoneNumber", "userName", password, role, "inviterCode", "offerCode", "isVerified", "isExpired", image, "brandName", "brandImage", "telegramUserId", "language", "marketId", "createdBy", "expirationDate", "createdAt", "updatedAt"
		FROM users WHERE "createdBy" = $1 ORDER BY id`, adminID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var u entity.User
		if err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.PhoneNumber, &u.UserName, &u.Password,
			&u.Role, &u.InviterCode, &u.OfferCode, &u.IsVerified, &u.IsExpired,
			&u.Image, &u.BrandName, &u.BrandImage, &u.TelegramUserID, &u.Language, &u.MarketID, &u.CreatedBy, &u.ExpirationDate, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		u.BusinessIDs, _ = r.getBusinessIDs(u.ID)
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepo) getBusinessIDs(userID int) ([]int, error) {
	rows, err := r.db.Query(`SELECT business_id FROM user_businesses WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func (r *UserRepo) setBusinessIDs(userID int, ids []int) error {
	_, err := r.db.Exec(`DELETE FROM user_businesses WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}
	for _, bid := range ids {
		_, err := r.db.Exec(`INSERT INTO user_businesses (user_id, business_id) VALUES ($1, $2)`, userID, bid)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *UserRepo) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM users WHERE id = $1`, id)
	if err != nil && (strings.Contains(err.Error(), "foreign key constraint") || strings.Contains(err.Error(), "violates foreign key constraint")) {
		return fmt.Errorf("Foydalanuvchiga tegishli bizneslar mavjudligi sababli o'chirib bo'lmaydi.")
	}
	return err
}
