package entity

import "time"

type Business struct {
	ID                    int       `json:"id"`
	UserID                int       `json:"userId"`
	Name                  *string   `json:"name"`
	Description           *string   `json:"description"`
	BusinessAccountNumber *string   `json:"businessAccountNumber"`
	Balance               float64   `json:"balance"`
	Image                 *string   `json:"image"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
	Address               *string   `json:"address"`
	RegionID              *int      `json:"regionId"`
	RegionName            string    `json:"regionName,omitempty"`
	DistrictID            *int      `json:"districtId"`
	DistrictName          string    `json:"districtName,omitempty"`
	MarketID              *int      `json:"marketId"`
	MarketName            string    `json:"marketName,omitempty"`
}

type CreateBusinessRequest struct {
	Name                  string  `json:"name" binding:"required"`
	Description           string  `json:"description"`
	BusinessAccountNumber string  `json:"businessAccountNumber"`
	Balance               float64 `json:"balance"`
	Image                 string  `json:"image"`
	RegionID              *int    `json:"regionId"`
	DistrictID            *int    `json:"districtId"`
	MarketID              *int    `json:"marketId"`
	Address               string  `json:"address"`
}

type UpdateBusinessRequest struct {
	Name                  *string  `json:"name"`
	Description           *string  `json:"description"`
	BusinessAccountNumber *string  `json:"businessAccountNumber"`
	Balance               *float64 `json:"balance"`
	Image                 *string  `json:"image"`
	RegionID              *int     `json:"regionId"`
	DistrictID            *int     `json:"districtId"`
	MarketID              *int     `json:"marketId"`
	Address               *string  `json:"address"`
}
