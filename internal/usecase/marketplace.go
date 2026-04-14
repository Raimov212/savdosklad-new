package usecase

import (
	"errors"

	"savdosklad/internal/entity"
	"savdosklad/internal/repository/postgres"
)

type MarketplaceUseCase struct {
	marketplaceRepo *postgres.MarketplaceRepo
	cartRepo        *postgres.CartRepo
	addressRepo     *postgres.AddressRepo
}

func NewMarketplaceUseCase(
	marketplaceRepo *postgres.MarketplaceRepo,
	cartRepo *postgres.CartRepo,
	addressRepo *postgres.AddressRepo,
) *MarketplaceUseCase {
	return &MarketplaceUseCase{
		marketplaceRepo: marketplaceRepo,
		cartRepo:        cartRepo,
		addressRepo:     addressRepo,
	}
}

// Public product listing
func (uc *MarketplaceUseCase) GetProducts(filter postgres.ProductFilter) ([]entity.MarketplaceProduct, int, error) {
	return uc.marketplaceRepo.GetPublicProducts(filter)
}

func (uc *MarketplaceUseCase) GetProductByID(id int) (*entity.MarketplaceProduct, error) {
	return uc.marketplaceRepo.GetProductByID(id)
}

func (uc *MarketplaceUseCase) GetCategories() ([]entity.MarketplaceCategory, error) {
	return uc.marketplaceRepo.GetCategories()
}

func (uc *MarketplaceUseCase) GetBusinesses() ([]entity.Business, error) {
	return uc.marketplaceRepo.GetBusinesses()
}

// Cart operations
func (uc *MarketplaceUseCase) GetCart(customerID int) (*entity.Cart, error) {
	return uc.cartRepo.GetCartWithItems(customerID)
}

func (uc *MarketplaceUseCase) AddToCart(customerID int, req *entity.AddCartItemRequest) (*entity.CartItem, error) {
	// Verify marketplace product exists and is available
	product, err := uc.marketplaceRepo.GetProductByID(req.ProductID)
	if err != nil {
		return nil, errors.New("product not found")
	}
	if product.Quantity < req.Quantity {
		return nil, errors.New("insufficient product quantity")
	}

	cart, err := uc.cartRepo.GetOrCreateCart(customerID)
	if err != nil {
		return nil, err
	}

	return uc.cartRepo.AddItem(cart.ID, req)
}

func (uc *MarketplaceUseCase) UpdateCartItem(customerID, itemID, quantity int) error {
	cart, err := uc.cartRepo.GetOrCreateCart(customerID)
	if err != nil {
		return err
	}
	return uc.cartRepo.UpdateItemQuantity(itemID, cart.ID, quantity)
}

func (uc *MarketplaceUseCase) RemoveCartItem(customerID, itemID int) error {
	cart, err := uc.cartRepo.GetOrCreateCart(customerID)
	if err != nil {
		return err
	}
	return uc.cartRepo.RemoveItem(itemID, cart.ID)
}

// Address operations
func (uc *MarketplaceUseCase) CreateAddress(customerID int, req *entity.CreateAddressRequest) (*entity.Address, error) {
	address := &entity.Address{
		CustomerID: customerID,
		Title:      req.Title,
		Address:    req.Address,
		IsDefault:  req.IsDefault,
	}
	if req.City != "" {
		address.City = &req.City
	}
	if req.District != "" {
		address.District = &req.District
	}

	if err := uc.addressRepo.Create(address); err != nil {
		return nil, err
	}
	return address, nil
}

func (uc *MarketplaceUseCase) GetAddresses(customerID int) ([]entity.Address, error) {
	return uc.addressRepo.GetByCustomerID(customerID)
}

func (uc *MarketplaceUseCase) UpdateAddress(id, customerID int, req *entity.UpdateAddressRequest) error {
	return uc.addressRepo.Update(id, customerID, req)
}

func (uc *MarketplaceUseCase) DeleteAddress(id, customerID int) error {
	return uc.addressRepo.Delete(id, customerID)
}
