package entity

import "time"

type CashbackTier struct {
	ID         int       `json:"id"`
	BusinessID int       `json:"businessId"`
	Name       string    `json:"name"`
	MinSpend   float64   `json:"minSpend"`
	Percentage float64   `json:"percentage"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateCashbackTierRequest struct {
	BusinessID int     `json:"businessId" binding:"required"`
	Name       string  `json:"name"`
	MinSpend   float64 `json:"minSpend"`
	MinAmount  float64 `json:"minAmount"` // frontend alias for minSpend
	Percentage float64 `json:"percentage"`
}

type UpdateCashbackTierRequest struct {
	Name       *string  `json:"name"`
	MinSpend   *float64 `json:"minSpend"`
	Percentage *float64 `json:"percentage"`
}
