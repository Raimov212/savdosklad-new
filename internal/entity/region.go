package entity

import "time"

// Region - Viloyat
type Region struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateRegionRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateRegionRequest struct {
	Name *string `json:"name"`
}

// District - Tuman
type District struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	RegionID   int       `json:"regionId"`
	RegionName string    `json:"regionName,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateDistrictRequest struct {
	Name     string `json:"name" binding:"required"`
	RegionID int    `json:"regionId" binding:"required"`
}

type UpdateDistrictRequest struct {
	Name     *string `json:"name"`
	RegionID *int    `json:"regionId"`
}

// Market - Bozor
type Market struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Address      *string   `json:"address"`
	DistrictID   int       `json:"districtId"`
	DistrictName string    `json:"districtName,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type CreateMarketRequest struct {
	Name       string `json:"name" binding:"required"`
	Address    string `json:"address"`
	DistrictID int    `json:"districtId" binding:"required"`
}

type UpdateMarketRequest struct {
	Name       *string `json:"name"`
	Address    *string `json:"address"`
	DistrictID *int    `json:"districtId"`
}
