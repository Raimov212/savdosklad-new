package usecase

import (
	"savdosklad/internal/entity"
	"savdosklad/internal/repository"
)

type OrganizationUseCase struct {
	repo repository.OrganizationRepository
}

func NewOrganizationUseCase(r repository.OrganizationRepository) *OrganizationUseCase {
	return &OrganizationUseCase{repo: r}
}

func (uc *OrganizationUseCase) Create(userID int, req entity.CreateOrganizationRequest) (int, error) {
	org := &entity.Organization{
		UserID:      userID,
		OrgName:     req.OrgName,
		Inn:         req.Inn,
		BankName:    req.BankName,
		Mfo:         req.Mfo,
		BankAccount: req.BankAccount,
		Logo:        req.Logo,
		Description: req.Description,
	}
	return uc.repo.Create(org)
}

func (uc *OrganizationUseCase) GetByID(id int) (*entity.Organization, error) {
	return uc.repo.GetByID(id)
}

func (uc *OrganizationUseCase) GetByUserID(userID int) ([]entity.Organization, error) {
	return uc.repo.GetByUserID(userID)
}

func (uc *OrganizationUseCase) Update(id int, req entity.UpdateOrganizationRequest) error {
	org, err := uc.repo.GetByID(id)
	if err != nil {
		return err
	}

	if req.OrgName != nil {
		org.OrgName = *req.OrgName
	}
	if req.Inn != nil {
		org.Inn = *req.Inn
	}
	if req.BankName != nil {
		org.BankName = *req.BankName
	}
	if req.Mfo != nil {
		org.Mfo = *req.Mfo
	}
	if req.BankAccount != nil {
		org.BankAccount = *req.BankAccount
	}
	if req.Logo != nil {
		org.Logo = *req.Logo
	}
	if req.Description != nil {
		org.Description = *req.Description
	}

	return uc.repo.Update(id, org)
}

func (uc *OrganizationUseCase) Delete(id int) error {
	return uc.repo.Delete(id)
}
