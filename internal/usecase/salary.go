package usecase

import (
	"savdosklad/internal/entity"
	"savdosklad/internal/repository"
)

type SalaryUseCase struct {
	repo repository.SalaryRepository
}

func NewSalaryUseCase(repo repository.SalaryRepository) *SalaryUseCase {
	return &SalaryUseCase{repo: repo}
}

func (uc *SalaryUseCase) Create(req entity.CreateSalaryRequest) (int, error) {
	return uc.repo.Create(&entity.EmployeeSalary{
		EmployeeID:  req.EmployeeID,
		BusinessID:  req.BusinessID,
		Amount:      req.Amount,
		Month:       req.Month,
		Year:        req.Year,
		Description: req.Description,
	})
}

func (uc *SalaryUseCase) GetByBusinessID(bid int) ([]entity.EmployeeSalary, error) {
	return uc.repo.GetByBusinessID(bid)
}

func (uc *SalaryUseCase) GetByEmployeeID(empID int) ([]entity.EmployeeSalary, error) {
	return uc.repo.GetByEmployeeID(empID)
}

func (uc *SalaryUseCase) GetByPeriod(bid, month, year int) ([]entity.EmployeeSalary, error) {
	return uc.repo.GetByPeriod(bid, month, year)
}

func (uc *SalaryUseCase) GetTotalByPeriod(bid, month, year int) (float64, error) {
	return uc.repo.GetTotalByPeriod(bid, month, year)
}

func (uc *SalaryUseCase) Delete(id int) error {
	return uc.repo.Delete(id)
}
