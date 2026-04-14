package entity

import "time"

type Category struct {
	ID         int       `json:"id"`
	BusinessID int       `json:"businessId"`
	Name       string    `json:"name"`
	Image      *string   `json:"image"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateCategoryRequest struct {
	BusinessID int    `json:"businessId" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Image      string `json:"image"`
}

type UpdateCategoryRequest struct {
	Name  *string `json:"name"`
	Image *string `json:"image"`
}
