package entity

import "time"

type Address struct {
	ID         int       `json:"id"`
	CustomerID int       `json:"customerId"`
	Title      string    `json:"title"`
	Address    string    `json:"address"`
	City       *string   `json:"city"`
	District   *string   `json:"district"`
	IsDefault  bool      `json:"isDefault"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateAddressRequest struct {
	Title     string `json:"title" binding:"required"`
	Address   string `json:"address" binding:"required"`
	City      string `json:"city"`
	District  string `json:"district"`
	IsDefault bool   `json:"isDefault"`
}

type UpdateAddressRequest struct {
	Title     *string `json:"title"`
	Address   *string `json:"address"`
	City      *string `json:"city"`
	District  *string `json:"district"`
	IsDefault *bool   `json:"isDefault"`
}
