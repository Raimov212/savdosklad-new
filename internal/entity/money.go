package entity

import "time"

type Money struct {
	ID          int       `json:"id"`
	Value       float64   `json:"value"`
	Description *string   `json:"description"`
	AmountType  int       `json:"amountType"`
	BusinessID  int       `json:"businessId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateMoneyRequest struct {
	BusinessID  int     `json:"businessId" binding:"required"`
	Value       float64 `json:"value" binding:"required"`
	Description string  `json:"description"`
	AmountType  int     `json:"amountType" binding:"required"`
}
