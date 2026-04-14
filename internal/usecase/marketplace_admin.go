package usecase

import (
	"savdosklad/internal/entity"
	"savdosklad/internal/repository/postgres"
)

type MarketplaceAdminUseCase struct {
	repo *postgres.MarketplaceAdminRepo
}

func NewMarketplaceAdminUseCase(repo *postgres.MarketplaceAdminRepo) *MarketplaceAdminUseCase {
	return &MarketplaceAdminUseCase{repo: repo}
}

// ==================== CATEGORIES ====================

func (uc *MarketplaceAdminUseCase) CreateCategory(req *entity.CreateMarketplaceCategoryRequest) (*entity.MarketplaceCategory, error) {
	return uc.repo.CreateCategory(req)
}

func (uc *MarketplaceAdminUseCase) GetAllCategories() ([]entity.MarketplaceCategory, error) {
	return uc.repo.GetAllCategories()
}

func (uc *MarketplaceAdminUseCase) GetCategoryByID(id int) (*entity.MarketplaceCategory, error) {
	return uc.repo.GetCategoryByID(id)
}

func (uc *MarketplaceAdminUseCase) UpdateCategory(id int, req *entity.UpdateMarketplaceCategoryRequest) error {
	return uc.repo.UpdateCategory(id, req)
}

func (uc *MarketplaceAdminUseCase) DeleteCategory(id int) error {
	return uc.repo.DeleteCategory(id)
}

// ==================== PRODUCTS ====================

func (uc *MarketplaceAdminUseCase) CreateProduct(req *entity.CreateMarketplaceProductRequest) (*entity.MarketplaceProduct, error) {
	return uc.repo.CreateProduct(req)
}

func (uc *MarketplaceAdminUseCase) GetAllProducts() ([]entity.MarketplaceProduct, error) {
	return uc.repo.GetAllProducts()
}

func (uc *MarketplaceAdminUseCase) GetProductByID(id int) (*entity.MarketplaceProduct, error) {
	return uc.repo.GetProductByID(id)
}

func (uc *MarketplaceAdminUseCase) UpdateProduct(id int, req *entity.UpdateMarketplaceProductRequest) error {
	// Agar miqdor o'zgarsa, inventar sinxronizatsiyasi kerak
	if req.Quantity != nil {
		if err := uc.repo.UpdateProductQuantity(id, *req.Quantity); err != nil {
			return err
		}
		// quantity allaqachon yangilangan, uni qayta yozmaslik uchun nil qilish
		req.Quantity = nil
	}
	return uc.repo.UpdateProduct(id, req)
}

func (uc *MarketplaceAdminUseCase) DeleteProduct(id int) error {
	return uc.repo.DeleteProduct(id)
}
