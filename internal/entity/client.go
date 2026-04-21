package entity

import "time"

type Client struct {
	ID             int       `json:"id"`
	BusinessID     int       `json:"businessId"`
	FullName       string    `json:"fullName"`
	Phone          string    `json:"phone"`
	Address        *string   `json:"address"`
	TelegramUserID *int64    `json:"telegramUserId"`
	Language       *string   `json:"language"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type CreateClientRequest struct {
	BusinessID int    `json:"businessId" binding:"required"`
	FullName   string `json:"fullName" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Address    string `json:"address"`
}

type UpdateClientRequest struct {
	BusinessID int     `json:"businessId"`
	FullName   *string `json:"fullName"`
	Phone      *string `json:"phone"`
	Address    *string `json:"address"`
}
