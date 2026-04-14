package usecase

import (
	"savdosklad/internal/entity"
	"savdosklad/internal/repository"
)

type BusinessUseCase struct {
	repo repository.BusinessRepository
}

func NewBusinessUseCase(repo repository.BusinessRepository) *BusinessUseCase {
	return &BusinessUseCase{repo: repo}
}

func (uc *BusinessUseCase) Create(userID int, req entity.CreateBusinessRequest) (int, error) {
	if req.RegionID != nil && *req.RegionID == 0 {
		req.RegionID = nil
	}
	if req.DistrictID != nil && *req.DistrictID == 0 {
		req.DistrictID = nil
	}
	if req.MarketID != nil && *req.MarketID == 0 {
		req.MarketID = nil
	}

	b := &entity.Business{
		UserID:         userID,
		Name:           &req.Name,
		Balance:        req.Balance,
		RegionID:       req.RegionID,
		DistrictID:     req.DistrictID,
		MarketID:       req.MarketID,
		Address:        &req.Address,
	}
	if req.Description != "" {
		b.Description = &req.Description
	}
	if req.BusinessAccountNumber != "" {
		b.BusinessAccountNumber = &req.BusinessAccountNumber
	}
	if req.Image != "" {
		b.Image = &req.Image
	}
	return uc.repo.Create(b)
}

func (uc *BusinessUseCase) GetAll() ([]entity.Business, error)       { return uc.repo.GetAll() }
func (uc *BusinessUseCase) GetByID(id int) (*entity.Business, error) { return uc.repo.GetByID(id) }
func (uc *BusinessUseCase) GetByUserID(uid int) ([]entity.Business, error) {
	return uc.repo.GetByUserID(uid)
}
func (uc *BusinessUseCase) Update(id int, req entity.UpdateBusinessRequest) error {
	return uc.repo.Update(id, req)
}
func (uc *BusinessUseCase) Delete(id int) error { return uc.repo.Delete(id) }
