package postgres

import (
	"database/sql"
	"savdosklad/internal/entity"
)

type OrderRepo struct {
	db *sql.DB
}

func NewOrderRepo(db *sql.DB) *OrderRepo {
	return &OrderRepo{db: db}
}

func (r *OrderRepo) Create(order *entity.Order) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO orders ("customerId", "businessId", "totalSum", status) VALUES ($1, $2, $3, $4) RETURNING id, "createdAt"`
	err = tx.QueryRow(query, order.CustomerID, order.BusinessID, order.TotalSum, order.Status).Scan(&order.ID, &order.CreatedAt)
	if err != nil {
		return err
	}

	for i := range order.Items {
		item := &order.Items[i]
		itemQuery := `INSERT INTO order_items ("orderId", "marketplaceProductId", quantity, price) VALUES ($1, $2, $3, $4) RETURNING id`
		err = tx.QueryRow(itemQuery, order.ID, item.MarketplaceProductID, item.Quantity, item.Price).Scan(&item.ID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *OrderRepo) GetByCustomerID(customerID int) ([]entity.Order, error) {
	query := `
		SELECT o.id, o."customerId", o."businessId", b.name as businessName, o.status, o."totalSum", o."createdAt" 
		FROM orders o
		LEFT JOIN businesses b ON o."businessId" = b.id
		WHERE o."customerId" = $1 
		ORDER BY o."createdAt" DESC`
	rows, err := r.db.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []entity.Order
	for rows.Next() {
		var o entity.Order
		var businessName sql.NullString
		if err := rows.Scan(&o.ID, &o.CustomerID, &o.BusinessID, &businessName, &o.Status, &o.TotalSum, &o.CreatedAt); err != nil {
			return nil, err
		}
		o.BusinessName = businessName.String
		
		items, err := r.GetOrderItems(o.ID)
		if err == nil {
			o.Items = items
			if o.BusinessName == "" && len(items) > 0 && items[0].Product != nil {
				o.BusinessName = items[0].Product.BusinessName
			}
		}
		orders = append(orders, o)
	}
	return orders, nil
}

func (r *OrderRepo) GetOrderItems(orderID int) ([]entity.OrderItem, error) {
	query := `
		SELECT oi.id, oi."orderId", oi."marketplaceProductId", oi.quantity, oi.price, 
		       mp.name, mp.images, mc.name as categoryName, COALESCE(b.name, '') as businessName
		FROM order_items oi
		JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
		LEFT JOIN marketplace_categories mc ON mp."marketplaceCategoryId" = mc.id
		LEFT JOIN businesses b ON mp."businessId" = b.id
		WHERE oi."orderId" = $1`
	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.OrderItem
	for rows.Next() {
		var i entity.OrderItem
		var productName string
		var images *string
		var categoryName sql.NullString
		var businessName string
		if err := rows.Scan(&i.ID, &i.OrderID, &i.MarketplaceProductID, &i.Quantity, &i.Price, 
			&productName, &images, &categoryName, &businessName); err != nil {
			return nil, err
		}
		i.Product = &entity.MarketplaceProduct{
			Name:         productName,
			Images:       images,
			CategoryName: categoryName.String,
			BusinessName: businessName,
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *OrderRepo) GetAll(status string) ([]entity.Order, error) {
	query := `
		SELECT o.id, o."customerId", o."businessId", o.status, o."totalSum", o."createdAt",
		       c."firstName", c."lastName", c."phoneNumber"
		FROM orders o
		JOIN customers c ON o."customerId" = c.id
		WHERE ($1 = '' OR o.status = ANY(string_to_array($1, ',')))
		ORDER BY o."createdAt" DESC`
	rows, err := r.db.Query(query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []entity.Order
	for rows.Next() {
		var o entity.Order
		var c entity.Customer
		if err := rows.Scan(&o.ID, &o.CustomerID, &o.BusinessID, &o.Status, &o.TotalSum, &o.CreatedAt,
			&c.FirstName, &c.LastName, &c.PhoneNumber); err != nil {
			return nil, err
		}
		o.Customer = &c
		
		// For Super Admin in GetAll, we don't strictly filter items by business, 
		// but we fetch all items of the order.
		items, _ := r.GetOrderItems(o.ID)
		o.Items = items
		orders = append(orders, o)
	}
	return orders, nil
}

func (r *OrderRepo) GetByBusinessID(businessID int, userID int, status string) ([]entity.Order, error) {
	var query string
	var rows *sql.Rows
	var err error

	if businessID > 0 {
		query = `
			SELECT o.id, o."customerId", o."businessId", o.status, o."totalSum", o."createdAt",
							c."firstName", c."lastName", c."phoneNumber"
			FROM orders o
			JOIN customers c ON o."customerId" = c.id
			WHERE (o."businessId" = $1 OR o.id IN (
				SELECT oi."orderId" FROM order_items oi
				JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
				WHERE mp."businessId" = $1
			)) AND ($2 = '' OR o.status = ANY(string_to_array($2, ',')))
			ORDER BY o."createdAt" DESC`
		rows, err = r.db.Query(query, businessID, status)
	} else {
		// All businesses belonging to the user
		query = `
			SELECT o.id, o."customerId", o."businessId", o.status, o."totalSum", o."createdAt",
							c."firstName", c."lastName", c."phoneNumber"
			FROM orders o
			JOIN customers c ON o."customerId" = c.id
			WHERE (o."businessId" IN (SELECT business_id FROM user_businesses WHERE user_id = $1)
			   OR o.id IN (
				SELECT oi."orderId" FROM order_items oi
				JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
				WHERE mp."businessId" IN (SELECT business_id FROM user_businesses WHERE user_id = $1)
			)) AND ($2 = '' OR o.status = ANY(string_to_array($2, ',')))
			ORDER BY o."createdAt" DESC`
		rows, err = r.db.Query(query, userID, status)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []entity.Order
	for rows.Next() {
		var o entity.Order
		var c entity.Customer
		if err := rows.Scan(&o.ID, &o.CustomerID, &o.BusinessID, &o.Status, &o.TotalSum, &o.CreatedAt,
			&c.FirstName, &c.LastName, &c.PhoneNumber); err != nil {
			return nil, err
		}
		o.Customer = &c
		
		// Fetch items. If businessID > 0, filter items for that business. 
		// If businessID == 0, fetch items for ALL businesses the user has access to.
		var items []entity.OrderItem
		if businessID > 0 {
			items, _ = r.GetOrderItemsByBusiness(o.ID, businessID)
		} else {
			items, _ = r.GetOrderItemsByUser(o.ID, userID)
		}
		o.Items = items
		orders = append(orders, o)
	}
	return orders, nil
}

func (r *OrderRepo) GetOrderItemsByUser(orderID int, userID int) ([]entity.OrderItem, error) {
	query := `
		SELECT oi.id, oi."orderId", oi."marketplaceProductId", oi.quantity, oi.price, 
		       mp.name, mp.images, mc.name as categoryName
		FROM order_items oi
		JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
		LEFT JOIN marketplace_categories mc ON mp."marketplaceCategoryId" = mc.id
		WHERE oi."orderId" = $1 AND mp."businessId" IN (SELECT business_id FROM user_businesses WHERE user_id = $2)`
	rows, err := r.db.Query(query, orderID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.OrderItem
	for rows.Next() {
		var i entity.OrderItem
		var productName string
		var images *string
		var categoryName sql.NullString
		if err := rows.Scan(&i.ID, &i.OrderID, &i.MarketplaceProductID, &i.Quantity, &i.Price, 
			&productName, &images, &categoryName); err != nil {
			return nil, err
		}
		i.Product = &entity.MarketplaceProduct{
			Name:         productName,
			Images:       images,
			CategoryName: categoryName.String,
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *OrderRepo) GetOrderItemsByBusiness(orderID int, businessID int) ([]entity.OrderItem, error) {
	query := `
		SELECT oi.id, oi."orderId", oi."marketplaceProductId", oi.quantity, oi.price, 
		       mp.name, mp.images, mc.name as categoryName
		FROM order_items oi
		JOIN marketplace_products mp ON oi."marketplaceProductId" = mp.id
		LEFT JOIN marketplace_categories mc ON mp."marketplaceCategoryId" = mc.id
		WHERE oi."orderId" = $1 AND mp."businessId" = $2`
	rows, err := r.db.Query(query, orderID, businessID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entity.OrderItem
	for rows.Next() {
		var i entity.OrderItem
		var productName string
		var images *string
		var categoryName sql.NullString
		if err := rows.Scan(&i.ID, &i.OrderID, &i.MarketplaceProductID, &i.Quantity, &i.Price, 
			&productName, &images, &categoryName); err != nil {
			return nil, err
		}
		i.Product = &entity.MarketplaceProduct{
			Name:         productName,
			Images:       images,
			CategoryName: categoryName.String,
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *OrderRepo) UpdateStatus(id int, status entity.OrderStatus) error {
	_, err := r.db.Exec(`UPDATE orders SET status = $1, "updatedAt" = NOW() WHERE id = $2`, status, id)
	return err
}
