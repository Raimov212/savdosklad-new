package entity

import "time"

// MarketplaceCategory — marketplace uchun alohida kategoriya
type MarketplaceCategory struct {
	ID         int       `json:"id"`
	CategoryID *int      `json:"categoryId"`
	Name       string    `json:"name"`
	Image      *string   `json:"image"`
	IsVisible  bool      `json:"isVisible"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateMarketplaceCategoryRequest struct {
	CategoryID *int   `json:"categoryId"`
	Name       string `json:"name" binding:"required"`
	Image      string `json:"image"`
}

type UpdateMarketplaceCategoryRequest struct {
	Name      *string `json:"name"`
	Image     *string `json:"image"`
	IsVisible *bool   `json:"isVisible"`
}

// MarketplaceProduct — marketplace uchun alohida mahsulot
type MarketplaceProduct struct {
	ID                    int       `json:"id"`
	ProductID             *int      `json:"productId"`
	BusinessID            *int      `json:"businessId"`
	MarketplaceCategoryID *int      `json:"marketplaceCategoryId"`
	Name                  string    `json:"name"`
	ShortDescription      *string   `json:"shortDescription"`
	FullDescription       *string   `json:"fullDescription"`
	Price                 float64   `json:"price"`
	Discount              float64   `json:"discount"`
	Quantity              int       `json:"quantity"`
	Images                *string   `json:"images"`
	IsVisible             bool      `json:"isVisible"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
	BusinessName          string    `json:"businessName"`
}

type CreateMarketplaceProductRequest struct {
	ProductID             *int    `json:"productId"`
	BusinessID            *int    `json:"businessId"`
	MarketplaceCategoryID *int    `json:"marketplaceCategoryId"`
	Name                  string  `json:"name" binding:"required"`
	ShortDescription      string  `json:"shortDescription"`
	FullDescription       string  `json:"fullDescription"`
	Price                 float64 `json:"price" binding:"required"`
	Discount              float64 `json:"discount"`
	Quantity              int     `json:"quantity" binding:"required,min=1"`
	Images                string  `json:"images"`
}

type UpdateMarketplaceProductRequest struct {
	MarketplaceCategoryID *int     `json:"marketplaceCategoryId"`
	Name                  *string  `json:"name"`
	ShortDescription      *string  `json:"shortDescription"`
	FullDescription       *string  `json:"fullDescription"`
	Price                 *float64 `json:"price"`
	Discount              *float64 `json:"discount"`
	Quantity              *int     `json:"quantity"`
	Images                *string  `json:"images"`
	IsVisible             *bool    `json:"isVisible"`
}
