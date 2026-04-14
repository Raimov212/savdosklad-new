package postgres

import (
	"database/sql"

	"savdosklad/internal/entity"
)

type CartRepo struct {
	db *sql.DB
}

func NewCartRepo(db *sql.DB) *CartRepo {
	return &CartRepo{db: db}
}

func (r *CartRepo) GetOrCreateCart(customerID int) (*entity.Cart, error) {
	cart := &entity.Cart{}

	// Try to get existing cart
	err := r.db.QueryRow(`SELECT id, "customerId", "createdAt", "updatedAt" FROM carts WHERE "customerId" = $1`, customerID).
		Scan(&cart.ID, &cart.CustomerID, &cart.CreatedAt, &cart.UpdatedAt)

	if err == sql.ErrNoRows {
		// Create new cart
		err = r.db.QueryRow(`INSERT INTO carts ("customerId") VALUES ($1) RETURNING id, "customerId", "createdAt", "updatedAt"`, customerID).
			Scan(&cart.ID, &cart.CustomerID, &cart.CreatedAt, &cart.UpdatedAt)
	}
	if err != nil {
		return nil, err
	}
	return cart, nil
}

func (r *CartRepo) AddItem(cartID int, req *entity.AddCartItemRequest) (*entity.CartItem, error) {
	item := &entity.CartItem{}

	// UPSERT: if product already in cart, increase quantity
	query := `INSERT INTO cart_items ("cartId", "marketplaceProductId", quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT ("cartId", "marketplaceProductId")
		DO UPDATE SET quantity = cart_items.quantity + $3, "updatedAt" = NOW()
		RETURNING id, "cartId", "marketplaceProductId", quantity, "createdAt", "updatedAt"`

	err := r.db.QueryRow(query, cartID, req.ProductID, req.Quantity).
		Scan(&item.ID, &item.CartID, &item.ProductID, &item.Quantity, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *CartRepo) UpdateItemQuantity(itemID, cartID, quantity int) error {
	_, err := r.db.Exec(`UPDATE cart_items SET quantity = $1, "updatedAt" = NOW() WHERE id = $2 AND "cartId" = $3`,
		quantity, itemID, cartID)
	return err
}

func (r *CartRepo) RemoveItem(itemID, cartID int) error {
	_, err := r.db.Exec(`DELETE FROM cart_items WHERE id = $1 AND "cartId" = $2`, itemID, cartID)
	return err
}

func (r *CartRepo) GetCartWithItems(customerID int) (*entity.Cart, error) {
	cart, err := r.GetOrCreateCart(customerID)
	if err != nil {
		return nil, err
	}

	query := `SELECT ci.id, ci."cartId", ci."marketplaceProductId", ci.quantity, ci."createdAt", ci."updatedAt",
		mp.id, mp.name, mp."shortDescription", mp."fullDescription", mp.price, mp.discount, mp.quantity,
		mp.images, mp."isVisible", mp."createdAt", mp."updatedAt"
		FROM cart_items ci
		JOIN marketplace_products mp ON ci."marketplaceProductId" = mp.id
		WHERE ci."cartId" = $1
		ORDER BY ci."createdAt" DESC`

	rows, err := r.db.Query(query, cart.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var total float64
	for rows.Next() {
		var ci entity.CartItem
		mp := &entity.MarketplaceProduct{}
		if err := rows.Scan(
			&ci.ID, &ci.CartID, &ci.ProductID, &ci.Quantity, &ci.CreatedAt, &ci.UpdatedAt,
			&mp.ID, &mp.Name, &mp.ShortDescription, &mp.FullDescription, &mp.Price, &mp.Discount,
			&mp.Quantity, &mp.Images, &mp.IsVisible, &mp.CreatedAt, &mp.UpdatedAt,
		); err != nil {
			return nil, err
		}
		ci.MarketplaceProduct = mp

		// Calculate price with discount
		price := mp.Price
		if mp.Discount > 0 {
			price = mp.Price - (mp.Price * mp.Discount / 100)
		}
		total += price * float64(ci.Quantity)

		cart.Items = append(cart.Items, ci)
	}
	cart.Total = total

	return cart, nil
}

func (r *CartRepo) ClearCart(cartID int) error {
	_, err := r.db.Exec(`DELETE FROM cart_items WHERE "cartId" = $1`, cartID)
	return err
}
