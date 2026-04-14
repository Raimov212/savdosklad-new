package entity

import "time"

type Cart struct {
	ID         int        `json:"id"`
	CustomerID int        `json:"customerId"`
	Items      []CartItem `json:"items"`
	Total      float64    `json:"total"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

type CartItem struct {
	ID                 int                 `json:"id"`
	CartID             int                 `json:"cartId"`
	ProductID          int                 `json:"marketplaceProductId"`
	Quantity           int                 `json:"quantity"`
	Product            *Product            `json:"product,omitempty"`
	MarketplaceProduct *MarketplaceProduct `json:"marketplaceProduct,omitempty"`
	CreatedAt          time.Time           `json:"createdAt"`
	UpdatedAt          time.Time           `json:"updatedAt"`
}

type AddCartItemRequest struct {
	ProductID int `json:"productId" binding:"required"`
	Quantity  int `json:"quantity" binding:"required,min=1"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}
