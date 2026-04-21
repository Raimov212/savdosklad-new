package entity

import "time"

type Product struct {
	ID               int       `json:"id"`
	Name             *string   `json:"name"`
	LokalCode        *string   `json:"lokalCode"`
	ShortDescription *string   `json:"shortDescription"`
	FullDescription  *string   `json:"fullDescription"`
	Price            float64   `json:"price"`
	Discount         float64   `json:"discount"`
	Quantity         int       `json:"quantity"`
	Images           *string   `json:"images"`
	Barcode          *string   `json:"barcode"`
	Country          *string   `json:"country"`
	CategoryID       int       `json:"categoryId"`
	BusinessID       int       `json:"businessId"`
	IsDeleted        bool      `json:"isDeleted"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type CreateProductRequest struct {
	Name             string  `json:"name" binding:"required"`
	LokalCode        string  `json:"lokalCode"`
	ShortDescription string  `json:"shortDescription"`
	FullDescription  string  `json:"fullDescription"`
	Price            float64 `json:"price" binding:"required"`
	Discount         float64 `json:"discount"`
	Quantity         int     `json:"quantity" binding:"required"`
	Images           string  `json:"images"`
	Barcode          string  `json:"barcode"`
	Country          string  `json:"country"`
	CategoryID       int     `json:"categoryId" binding:"required"`
	BusinessID       int     `json:"businessId" binding:"required"`
}

type UpdateProductRequest struct {
	Name             *string  `json:"name"`
	LokalCode        *string  `json:"lokalCode"`
	ShortDescription *string  `json:"shortDescription"`
	FullDescription  *string  `json:"fullDescription"`
	Price            *float64 `json:"price"`
	Discount         *float64 `json:"discount"`
	Quantity         *int     `json:"quantity"`
	Images           *string  `json:"images"`
	Barcode          *string  `json:"barcode"`
	Country          *string  `json:"country"`
	CategoryID       *int     `json:"categoryId"`
	IsDeleted        *bool    `json:"isDeleted"`
}

type ProductChange struct {
	ID          int       `json:"id"`
	OldPrice    float64   `json:"oldPrice"`
	NewPrice    float64   `json:"newPrice"`
	OldDiscount float64   `json:"oldDiscount"`
	NewDiscount float64   `json:"newDiscount"`
	OldQuantity int       `json:"oldQuantity"`
	NewQuantity int       `json:"newQuantity"`
	ProductID   int       `json:"productId"`
	BusinessID  int       `json:"businessId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type BulkDeleteRequest struct {
	ID         int       `json:"id"`
	BusinessID int       `json:"businessId"`
	CategoryID *int      `json:"categoryId"`
	ProductIDs string    `json:"productIds"` // Comma separated IDs
	CreatedBy  int       `json:"createdBy"`
	Status     string    `json:"status"` // pending, approved, rejected
	BusinessName string    `json:"businessName,omitempty"`
	CategoryName string    `json:"categoryName,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
