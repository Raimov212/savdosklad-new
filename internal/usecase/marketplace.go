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
	orderRepo       *postgres.OrderRepo
}

func NewMarketplaceUseCase(
	marketplaceRepo *postgres.MarketplaceRepo,
	cartRepo *postgres.CartRepo,
	addressRepo *postgres.AddressRepo,
	orderRepo *postgres.OrderRepo,
) *MarketplaceUseCase {
	return &MarketplaceUseCase{
		marketplaceRepo: marketplaceRepo,
		cartRepo:        cartRepo,
		addressRepo:     addressRepo,
		orderRepo:       orderRepo,
	}
}

// Order operations
func (uc *MarketplaceUseCase) CreateOrder(customerID int, req *entity.CreateOrderRequest) ([]entity.Order, error) {
	// Group items by business
	businessItems := make(map[int][]entity.OrderItem)
	for _, itemReq := range req.Items {
		prod, err := uc.marketplaceRepo.GetProductByID(itemReq.MarketplaceProductID)
		if err != nil {
			return nil, err
		}
		bizID := 0
		if prod.BusinessID != nil {
			bizID = *prod.BusinessID
		}
		
		item := entity.OrderItem{
			MarketplaceProductID: itemReq.MarketplaceProductID,
			Quantity:             itemReq.Quantity,
			Price:                prod.Price,
		}
		businessItems[bizID] = append(businessItems[bizID], item)
	}

	var createdOrders []entity.Order
	for bizID, items := range businessItems {
		var bID *int
		if bizID != 0 {
			val := bizID
			bID = &val
		}

		order := &entity.Order{
			CustomerID: customerID,
			BusinessID: bID,
			Status:     entity.OrderStatusPending,
			Items:      items,
		}

		var totalSum float64
		for _, item := range items {
			totalSum += item.Price * float64(item.Quantity)
		}
		order.TotalSum = totalSum

		if err := uc.orderRepo.Create(order); err != nil {
			return nil, err
		}
		createdOrders = append(createdOrders, *order)
	}

	return createdOrders, nil
}

func (uc *MarketplaceUseCase) GetOrdersByCustomer(customerID int) ([]entity.Order, error) {
	return uc.orderRepo.GetByCustomerID(customerID)
}

func (uc *MarketplaceUseCase) AdminGetOrders(status string) ([]entity.Order, error) {
	return uc.orderRepo.GetAll(status)
}

func (uc *MarketplaceUseCase) BusinessGetOrders(businessID int, userID int, status string) ([]entity.Order, error) {
	return uc.orderRepo.GetByBusinessID(businessID, userID, status)
}

func (uc *MarketplaceUseCase) UpdateOrderStatus(id int, status entity.OrderStatus) error {
	return uc.orderRepo.UpdateStatus(id, status)
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
