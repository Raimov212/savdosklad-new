package usecase

import (
	"savdosklad/internal/entity"
	"savdosklad/internal/repository/postgres"
)

type RegionUseCase struct {
	repo *postgres.RegionRepo
}

func NewRegionUseCase(repo *postgres.RegionRepo) *RegionUseCase {
	return &RegionUseCase{repo: repo}
}

// Regions
func (uc *RegionUseCase) CreateRegion(req entity.CreateRegionRequest) (int, error) {
	return uc.repo.CreateRegion(req)
}

func (uc *RegionUseCase) GetAllRegions() ([]entity.Region, error) {
	return uc.repo.GetAllRegions()
}

func (uc *RegionUseCase) UpdateRegion(id int, req entity.UpdateRegionRequest) error {
	return uc.repo.UpdateRegion(id, req)
}

func (uc *RegionUseCase) DeleteRegion(id int) error {
	return uc.repo.DeleteRegion(id)
}

// Districts
func (uc *RegionUseCase) CreateDistrict(req entity.CreateDistrictRequest) (int, error) {
	return uc.repo.CreateDistrict(req)
}

func (uc *RegionUseCase) GetAllDistricts() ([]entity.District, error) {
	return uc.repo.GetAllDistricts()
}

func (uc *RegionUseCase) GetDistrictsByRegionID(regionID int) ([]entity.District, error) {
	return uc.repo.GetDistrictsByRegionID(regionID)
}

func (uc *RegionUseCase) UpdateDistrict(id int, req entity.UpdateDistrictRequest) error {
	return uc.repo.UpdateDistrict(id, req)
}

func (uc *RegionUseCase) DeleteDistrict(id int) error {
	return uc.repo.DeleteDistrict(id)
}

// Markets
func (uc *RegionUseCase) CreateMarket(req entity.CreateMarketRequest) (int, error) {
	return uc.repo.CreateMarket(req)
}

func (uc *RegionUseCase) GetAllMarkets() ([]entity.Market, error) {
	return uc.repo.GetAllMarkets()
}

func (uc *RegionUseCase) GetMarketsByDistrictID(districtID int) ([]entity.Market, error) {
	return uc.repo.GetMarketsByDistrictID(districtID)
}

func (uc *RegionUseCase) UpdateMarket(id int, req entity.UpdateMarketRequest) error {
	return uc.repo.UpdateMarket(id, req)
}

func (uc *RegionUseCase) DeleteMarket(id int) error {
	return uc.repo.DeleteMarket(id)
}
