package usecase

import (
	"fmt"
	"savdosklad/internal/entity"
	"savdosklad/internal/notifier"
	"savdosklad/internal/repository"
	"savdosklad/pkg/i18n"
	"time"
)

type CategoryUseCase struct{ repo repository.CategoryRepository }

func NewCategoryUseCase(r repository.CategoryRepository) *CategoryUseCase {
	return &CategoryUseCase{repo: r}
}
func (uc *CategoryUseCase) Create(req entity.CreateCategoryRequest) (int, error) {
	c := &entity.Category{BusinessID: req.BusinessID, Name: req.Name}
	if req.Image != "" {
		c.Image = &req.Image
	}
	return uc.repo.Create(c)
}
func (uc *CategoryUseCase) GetByID(id int) (*entity.Category, error) { return uc.repo.GetByID(id) }
func (uc *CategoryUseCase) GetByBusinessID(bid int) ([]entity.Category, error) {
	return uc.repo.GetByBusinessID(bid)
}
func (uc *CategoryUseCase) Update(id int, req entity.UpdateCategoryRequest) error {
	return uc.repo.Update(id, req)
}
func (uc *CategoryUseCase) Delete(id int) error { return uc.repo.Delete(id) }

type ProductUseCase struct{ repo repository.ProductRepository }

func NewProductUseCase(r repository.ProductRepository) *ProductUseCase {
	return &ProductUseCase{repo: r}
}
func (uc *ProductUseCase) Create(req entity.CreateProductRequest) (int, error) {
	p := &entity.Product{
		Price: *req.Price, Discount: req.Discount, Quantity: *req.Quantity,
		CategoryID: req.CategoryID, BusinessID: req.BusinessID,
	}
	name := req.Name
	p.Name = &name
	if req.LokalCode != "" {
		lc := req.LokalCode
		p.LokalCode = &lc
	}
	if req.ShortDescription != "" {
		d := req.ShortDescription
		p.ShortDescription = &d
	}
	if req.FullDescription != "" {
		d := req.FullDescription
		p.FullDescription = &d
	}
	if req.Images != "" {
		i := req.Images
		p.Images = &i
	}
	if req.Barcode != "" {
		b := req.Barcode
		p.Barcode = &b
	}
	if req.Country != "" {
		c := req.Country
		p.Country = &c
	}
	return uc.repo.Create(p)
}
func (uc *ProductUseCase) GetByID(id int) (*entity.Product, error) { return uc.repo.GetByID(id) }
func (uc *ProductUseCase) GetByBusinessID(bid int) ([]entity.Product, error) {
	return uc.repo.GetByBusinessID(bid)
}
func (uc *ProductUseCase) GetByCategoryID(cid int) ([]entity.Product, error) {
	return uc.repo.GetByCategoryID(cid)
}
func (uc *ProductUseCase) Update(id int, req entity.UpdateProductRequest) error {
	return uc.repo.Update(id, req)
}
func (uc *ProductUseCase) Delete(id int) error { return uc.repo.Delete(id) }
func (uc *ProductUseCase) Search(bid int, query string) ([]entity.Product, error) {
	return uc.repo.Search(bid, query)
}
func (uc *ProductUseCase) GetByUserID(uid int) ([]entity.Product, error) {
	return uc.repo.GetByUserID(uid)
}
func (uc *ProductUseCase) SearchByUserID(uid int, query string) ([]entity.Product, error) {
	return uc.repo.SearchByUserID(uid, query)
}
func (uc *ProductUseCase) BulkDelete(bid int, categoryId *int, productIds []int) error {
	return uc.repo.BulkDelete(bid, categoryId, productIds)
}
func (uc *ProductUseCase) GetByIDs(ids []int) ([]entity.Product, error) {
	return uc.repo.GetByIDs(ids)
}
func (uc *ProductUseCase) CreateBulkDeleteRequest(req *entity.BulkDeleteRequest) (int, error) {
	return uc.repo.CreateBulkDeleteRequest(req)
}
func (uc *ProductUseCase) GetBulkDeleteRequests() ([]entity.BulkDeleteRequest, error) {
	return uc.repo.GetBulkDeleteRequests()
}
func (uc *ProductUseCase) UpdateBulkDeleteRequestStatus(id int, status string) error {
	return uc.repo.UpdateBulkDeleteRequestStatus(id, status)
}

type ClientUseCase struct {
	repo     repository.ClientRepository
	userRepo repository.UserRepository
}

func NewClientUseCase(r repository.ClientRepository, ur repository.UserRepository) *ClientUseCase {
	return &ClientUseCase{repo: r, userRepo: ur}
}
func (uc *ClientUseCase) Create(req entity.CreateClientRequest) (int, error) {
	// Check if this phone belongs to a user
	u, _ := uc.userRepo.GetByPhoneNumber(req.Phone)
	if u != nil {
		return 0, fmt.Errorf("this phone number belongs to a staff member and cannot be added as a client")
	}

	lang := "uz"
	c := &entity.Client{
		BusinessID: req.BusinessID,
		FullName:   req.FullName,
		Phone:      req.Phone,
		Language:   &lang,
	}
	if req.Address != "" {
		a := req.Address
		c.Address = &a
	}
	return uc.repo.Create(c)
}
func (uc *ClientUseCase) GetByID(id int) (*entity.Client, error) { return uc.repo.GetByID(id) }
func (uc *ClientUseCase) GetByBusinessID(bid int) ([]entity.Client, error) {
	return uc.repo.GetByBusinessID(bid)
}
func (uc *ClientUseCase) GetByTelegramID(tgID int64) ([]entity.Client, error) {
	return uc.repo.GetByTelegramID(tgID)
}
func (uc *ClientUseCase) Search(bid int, query string) ([]entity.Client, error) {
	return uc.repo.Search(bid, query)
}
func (uc *ClientUseCase) GetTotalDebt(clientID int) (float64, error) {
	return uc.repo.GetTotalDebt(clientID)
}
func (uc *ClientUseCase) Update(id int, req entity.UpdateClientRequest) error {
	if req.Phone != nil {
		u, _ := uc.userRepo.GetByPhoneNumber(*req.Phone)
		if u != nil {
			return fmt.Errorf("this phone number belongs to a staff member and cannot be added as a client")
		}
	}
	return uc.repo.Update(id, req)
}
func (uc *ClientUseCase) LinkTelegram(phone string, tgID int64) error {
	clients, err := uc.repo.GetByPhoneNumber(phone)
	if err != nil || len(clients) == 0 {
		return err
	}
	for _, c := range clients {
		_ = uc.repo.UpdateTelegramID(c.ID, tgID)
	}
	return nil
}
func (uc *ClientUseCase) UpdateLanguage(id int, lang string) error {
	return uc.repo.UpdateLanguage(id, lang)
}
func (uc *ClientUseCase) Delete(id int) error { return uc.repo.Delete(id) }

type TransactionUseCase struct {
	repo             repository.TransactionRepository
	clientRepo       repository.ClientRepository
	productRepo      repository.ProductRepository
	businessRepo     repository.BusinessRepository
	cashbackTierRepo repository.CashbackTierRepository
	notifier         *notifier.TelegramNotifier
}

func NewTransactionUseCase(r repository.TransactionRepository, cr repository.ClientRepository, pr repository.ProductRepository, br repository.BusinessRepository, ctr repository.CashbackTierRepository, n *notifier.TelegramNotifier) *TransactionUseCase {
	return &TransactionUseCase{repo: r, clientRepo: cr, productRepo: pr, businessRepo: br, cashbackTierRepo: ctr, notifier: n}
}
func (uc *TransactionUseCase) CreateSale(userID int, req entity.CreateTotalTransactionRequest) (int, error) {
	// 1. Fetch business settings
	business, err := uc.businessRepo.GetByID(req.BusinessID)
	if err != nil {
		return 0, err
	}

	// 2. Calculate cashback earned
	var cashbackEarned float64
	if business.CashbackEnabled {
		switch business.CashbackType {
		case "percentage":
			cashbackEarned = req.Total * business.CashbackPercentage / 100
		case "tiered":
			if req.ClientID != nil {
				client, _ := uc.clientRepo.GetByID(*req.ClientID)
				if client != nil {
					tiers, _ := uc.cashbackTierRepo.GetByBusinessID(req.BusinessID)
					var applicableTier *entity.CashbackTier
					for _, tier := range tiers {
						if client.TotalSpent >= tier.MinSpend {
							applicableTier = &tier
						} else {
							break // Tiers are sorted by minSpend
						}
					}
					if applicableTier != nil {
						cashbackEarned = req.Total * applicableTier.Percentage / 100
					}
				}
			}
		case "product_specific":
			for _, item := range req.Items {
				product, _ := uc.productRepo.GetByID(item.ProductID)
				if product != nil && product.CashbackPercentage > 0 {
					cashbackEarned += (item.ProductPrice * float64(item.ProductQuantity)) * product.CashbackPercentage / 100
				}
			}
		}
	}

	// 3. Handle using cashback
	if req.UseCashbackAmount > 0 && req.ClientID != nil {
		client, err := uc.clientRepo.GetByID(*req.ClientID)
		if err == nil && client.CashbackBalance >= req.UseCashbackAmount {
			// Actually use it - deduct from balance later
		} else {
			req.UseCashbackAmount = 0 // Reset if not enough balance
		}
	}

	// 3a. Handle using points
	if req.UsePointsAmount > 0 && req.ClientID != nil {
		client, err := uc.clientRepo.GetByID(*req.ClientID)
		if err == nil && client.PointsBalance >= req.UsePointsAmount {
			// Actually use it - deduct from balance later
		} else {
			req.UsePointsAmount = 0 // Reset if not enough balance
		}
	}

	// 3b. Calculate points earned based on non-debt payment
	var pointsEarned float64
	rate := business.PointsRate
	if rate <= 0 {
		rate = 10000 // Default fallback
	}
	actualPaid := req.Cash + req.Card + req.Click
	pointsEarned = actualPaid / rate

	tt := &entity.TotalTransaction{
		BusinessID: req.BusinessID, ClientID: req.ClientID,
		Total: req.Total, Cash: req.Cash, Card: req.Card, Click: req.Click, Debt: req.Debt,
		Discount: req.Discount, CreatedBy: &userID,
		CashbackEarned: cashbackEarned,
		CashbackUsed:   req.UseCashbackAmount,
		PointsEarned:   pointsEarned,
		PointsUsed:     req.UsePointsAmount,
	}
	if req.ClientNumber != "" {
		cn := req.ClientNumber
		tt.ClientNumber = &cn
	}
	if req.Description != "" {
		d := req.Description
		tt.Description = &d
	}
	tt.DebtLimitDate = req.DebtLimitDate

	totalID, err := uc.repo.CreateTotalTransaction(tt)
	if err != nil {
		return 0, err
	}

	for _, item := range req.Items {
		itemBid := item.BusinessID
		if itemBid == 0 {
			itemBid = req.BusinessID
		}
		// Individual item cashback for product_specific
		var itemCashback float64
		if business.CashbackEnabled && business.CashbackType == "product_specific" {
			product, _ := uc.productRepo.GetByID(item.ProductID)
			if product != nil {
				itemCashback = (item.ProductPrice * float64(item.ProductQuantity)) * product.CashbackPercentage / 100
			}
		}

		t := &entity.Transaction{
			ProductID: item.ProductID, ProductQuantity: item.ProductQuantity,
			ProductPrice: item.ProductPrice, BusinessID: itemBid, TotalTransactionID: totalID,
			CashbackAmount: itemCashback,
		}
		if item.Description != "" {
			d := item.Description
			t.Description = &d
		}
		if _, err := uc.repo.CreateTransaction(t); err != nil {
			return 0, err
		}
	}

	// 4. Update client balance and total spent
	if req.ClientID != nil {
		client, err := uc.clientRepo.GetByID(*req.ClientID)
		if err == nil {
			newBalance := client.CashbackBalance + cashbackEarned - req.UseCashbackAmount
			newPointsBalance := client.PointsBalance + pointsEarned - req.UsePointsAmount
			newTotalSpent := client.TotalSpent + (req.Total - req.Discount) // Net total
			
			updateReq := entity.UpdateClientRequest{
				CashbackBalance: &newBalance,
				PointsBalance:   &newPointsBalance,
				TotalSpent:      &newTotalSpent,
			}
			_ = uc.clientRepo.Update(client.ID, updateReq)
		}
	}

	if totalID != 0 && uc.notifier != nil {
		go uc.notifier.NotifySale(req.BusinessID, req.Total, len(req.Items))
	}
	return totalID, nil
}
func (uc *TransactionUseCase) GetByID(id int) (*entity.TotalTransaction, error) {
	return uc.repo.GetTotalTransactionByID(id)
}
func (uc *TransactionUseCase) GetByBusinessID(bid int) ([]entity.TotalTransaction, error) {
	return uc.repo.GetTotalTransactionsByBusinessID(bid)
}
func (uc *TransactionUseCase) GetByPeriod(bid int, start, end time.Time) ([]entity.TotalTransaction, error) {
	return uc.repo.GetTotalTransactionsByPeriod(bid, start, end)
}
func (uc *TransactionUseCase) GetStats(bid int, start, end *time.Time) (entity.TransactionStats, error) {
	return uc.repo.GetStats(bid, start, end)
}
func (uc *TransactionUseCase) GetItems(totalID int, bid int) ([]entity.Transaction, error) {
	return uc.repo.GetTransactionsByTotalID(totalID)
}
func (uc *TransactionUseCase) GetTransactionByID(id int) (*entity.Transaction, error) {
	return uc.repo.GetTransactionByID(id)
}
func (uc *TransactionUseCase) GetByBusinessIDWithLimit(bid int, limit int) ([]entity.TotalTransaction, error) {
	return uc.repo.GetRecentTransactionsByBusinessID(bid, limit)
}
func (r *TransactionUseCase) GetByClientIDWithLimit(clientID int, limit int) ([]entity.TotalTransaction, error) {
	return r.repo.GetRecentTransactionsByClientID(clientID, limit)
}


func (uc *TransactionUseCase) AddItemsToSale(totalID int, bid int, items []entity.CreateTransactionItemRequest) error {
	for _, item := range items {
		t := &entity.Transaction{
			ProductID: item.ProductID, ProductQuantity: item.ProductQuantity,
			ProductPrice: item.ProductPrice, BusinessID: bid, TotalTransactionID: totalID,
		}
		if item.Description != "" {
			d := item.Description
			t.Description = &d
		}
		if _, err := uc.repo.CreateTransaction(t); err != nil {
			return err
		}
	}
	if uc.notifier != nil {
		total := 0.0
		for _, item := range items {
			total += item.ProductPrice * float64(item.ProductQuantity)
		}
		// Go tili imkoniyati - "Goroutine (go)": Yangi mahsulot qo'shilganligi haqidagi telegram 
		// bildirishnomani orqa fonda jo'natadi. API so'rovini tezroq tugatish va mijoz interfeysini 
		// qotib qolishdan saqlash uchun qo'llanilgan.
		go uc.notifier.NotifySale(bid, total, len(items))
	}
	return nil
}

func (uc *TransactionUseCase) UpdateSale(id int, req entity.UpdateTotalTransactionRequest) error {
	tt, err := uc.repo.GetTotalTransactionByID(id)
	if err != nil {
		return err
	}
	tt.Total = req.Total
	tt.Cash = req.Cash
	tt.Card = req.Card
	tt.Click = req.Click
	tt.Debt = req.Debt
	tt.Discount = req.Discount
	tt.ClientID = req.ClientID
	if req.ClientNumber != "" {
		tt.ClientNumber = &req.ClientNumber
	}
	if req.Description != "" {
		tt.Description = &req.Description
	}
	tt.DebtLimitDate = req.DebtLimitDate

	err = uc.repo.UpdateTotalTransaction(tt)
	if err == nil && uc.notifier != nil {
		// Go tili imkoniyati - "Goroutine (go)": Yangilangan ma'lumot haqida telegram xabarni kutmasdan, 
		// darhol parallel jo'natish uchun funksiya "go" so'zi orqali alohida goroutineda chaqirilmoqda.
		go uc.notifier.NotifySale(tt.BusinessID, tt.Total, 0) // 0 means simplified final update notification
	}
	return err
}

func (uc *TransactionUseCase) SendReceipt(totalID int, pdfBytes, imgBytes []byte) error {
	trans, err := uc.repo.GetTotalTransactionByID(totalID)
	if err != nil {
		return err
	}
	if trans.ClientID == nil {
		return fmt.Errorf("this transaction has no client")
	}

	client, err := uc.clientRepo.GetByID(*trans.ClientID)
	if err != nil {
		return err
	}
	if client.TelegramUserID == nil || *client.TelegramUserID == 0 {
		return fmt.Errorf("client has no telegram linked")
	}

	lang := "uz"
	if client.Language != nil {
		lang = *client.Language
	}

	text := fmt.Sprintf("📄 %s #%d\n💰 %s", i18n.T(lang, "Sotuv tafsilotlari"), totalID, i18n.FormatMoney(trans.Total, lang))
	pdfName := fmt.Sprintf("Receipt_%d.pdf", totalID)
	imgName := fmt.Sprintf("Receipt_%d.jpg", totalID)

	if uc.notifier == nil {
		return fmt.Errorf("telegram xabarnomalar xizmati ishga tushmagan")
	}
	uc.notifier.SendReceipt(*client.TelegramUserID, text, pdfBytes, imgBytes, pdfName, imgName)
	return nil
}

func (uc *TransactionUseCase) UpdateItem(id int, req entity.UpdateTransactionItemRequest) error {
	item, err := uc.repo.GetTransactionByID(id)
	if err != nil {
		return err
	}

	// Calculate difference in quantity
	diff := item.ProductQuantity - req.ProductQuantity

	// Update product quantity in store
	if diff != 0 {
		if err := uc.productRepo.UpdateQuantity(item.ProductID, diff); err != nil {
			return err
		}
	}

	// Calculate difference in total price
	oldTotal := item.ProductPrice * float64(item.ProductQuantity)
	newTotal := req.ProductPrice * float64(req.ProductQuantity)
	priceDiff := newTotal - oldTotal

	// Update item
	item.ProductQuantity = req.ProductQuantity
	item.ProductPrice = req.ProductPrice
	if err := uc.repo.UpdateTransaction(item); err != nil {
		return err
	}

	// Update TotalTransaction header
	tt, err := uc.repo.GetTotalTransactionByID(item.TotalTransactionID)
	if err != nil {
		return err
	}
	tt.Total += priceDiff
	// Simple logic: add/subtract from cash for now, or keep debt same
	// Usually, if price changes, we update the total and potentially the debt or cash.
	// For simplicity, we just update the total and debt if it's a debt sale.
	if tt.Debt > 0 {
		tt.Debt += priceDiff
	} else {
		tt.Cash += priceDiff
	}

	return uc.repo.UpdateTotalTransaction(tt)
}

func (uc *TransactionUseCase) DeleteItem(id int) error {
	item, err := uc.repo.GetTransactionByID(id)
	if err != nil {
		return err
	}

	// Return product to stock
	if err := uc.productRepo.UpdateQuantity(item.ProductID, item.ProductQuantity); err != nil {
		return err
	}

	// Update TotalTransaction header
	tt, err := uc.repo.GetTotalTransactionByID(item.TotalTransactionID)
	if err != nil {
		return err
	}
	itemTotal := item.ProductPrice * float64(item.ProductQuantity)
	tt.Total -= itemTotal
	if tt.Debt > 0 {
		tt.Debt -= itemTotal
		if tt.Debt < 0 {
			tt.Cash += tt.Debt // Rebalance if debt becomes negative
			tt.Debt = 0
		}
	} else {
		tt.Cash -= itemTotal
	}

	if err := uc.repo.UpdateTotalTransaction(tt); err != nil {
		return err
	}

	return uc.repo.DeleteTransaction(id)
}

func (uc *TransactionUseCase) DeleteSale(id int) error {
	// 1. Get total transaction
	tt, err := uc.repo.GetTotalTransactionByID(id)
	if err != nil {
		return err
	}

	// 2. Get all items
	items, err := uc.repo.GetTransactionsByTotalID(id)
	if err != nil {
		return err
	}

	// 3. Return products to stock
	for _, item := range items {
		_ = uc.productRepo.UpdateQuantity(item.ProductID, item.ProductQuantity)
	}

	// 4. Revert client balances
	if tt.ClientID != nil {
		client, err := uc.clientRepo.GetByID(*tt.ClientID)
		if err == nil {
			newBalance := client.CashbackBalance - tt.CashbackEarned + tt.CashbackUsed
			newPointsBalance := client.PointsBalance - tt.PointsEarned + tt.PointsUsed
			newTotalSpent := client.TotalSpent - (tt.Total - tt.Discount)

			updateReq := entity.UpdateClientRequest{
				CashbackBalance: &newBalance,
				PointsBalance:   &newPointsBalance,
				TotalSpent:      &newTotalSpent,
			}
			_ = uc.clientRepo.Update(client.ID, updateReq)
		}
	}

	// 5. Delete total transaction and items (handled in repo)
	return uc.repo.DeleteTotalTransaction(id)
}


type RefundUseCase struct {
	repo            repository.RefundRepository
	productRepo     repository.ProductRepository
	transactionRepo repository.TransactionRepository
	notifier        *notifier.TelegramNotifier
}

func NewRefundUseCase(r repository.RefundRepository, pr repository.ProductRepository, tr repository.TransactionRepository, n *notifier.TelegramNotifier) *RefundUseCase {
	return &RefundUseCase{repo: r, productRepo: pr, transactionRepo: tr, notifier: n}
}
func (uc *RefundUseCase) Create(userID int, req entity.CreateTotalRefundRequest) (int, error) {
	tr := &entity.TotalRefund{
		BusinessID: req.BusinessID, ClientID: req.ClientID,
		Total: req.Total, Cash: req.Cash, Card: req.Card, Click: req.Click, Debt: req.Debt,
		Discount: req.Discount, CreatedBy: &userID,
	}
	if req.ClientNumber != "" {
		cn := req.ClientNumber
		tr.ClientNumber = &cn
	}
	if req.Description != "" {
		d := req.Description
		tr.Description = &d
	}
	tr.DebtLimitDate = req.DebtLimitDate

	totalID, err := uc.repo.CreateTotalRefund(tr)
	if err != nil {
		return 0, err
	}

	for _, item := range req.Items {
		rf := &entity.Refund{
			ProductID: item.ProductID, ProductQuantity: item.ProductQuantity,
			ProductPrice: item.ProductPrice, BusinessID: req.BusinessID,
			TotalRefundID: totalID, TransactionID: item.TransactionID,
		}
		if item.Description != "" {
			d := item.Description
			rf.Description = &d
		}
		if _, err := uc.repo.CreateRefund(rf); err != nil {
			return 0, err
		}

		// Update product quantity in stock (return items to ombor)
		if err := uc.productRepo.UpdateQuantity(item.ProductID, item.ProductQuantity); err != nil {
			fmt.Printf("Error updating product quantity during refund: %v\n", err)
		}

		// Update original transaction item quantity (kamaytirish)
		if item.TransactionID != 0 {
			origItem, err := uc.transactionRepo.GetTransactionByID(item.TransactionID)
			if err == nil && origItem != nil {
				origItem.ProductQuantity -= item.ProductQuantity
				if origItem.ProductQuantity < 0 {
					origItem.ProductQuantity = 0
				}
				_ = uc.transactionRepo.UpdateTransaction(origItem)

				// Update TotalTransaction total
				tt, err := uc.transactionRepo.GetTotalTransactionByID(origItem.TotalTransactionID)
				if err == nil && tt != nil {
					refundValue := item.ProductPrice * float64(item.ProductQuantity)
					tt.Total -= refundValue
					if tt.Total < 0 { tt.Total = 0 }
					_ = uc.transactionRepo.UpdateTotalTransaction(tt)
				}
			}
		}
	}
	return totalID, nil
}
func (uc *RefundUseCase) GetByID(id int) (*entity.TotalRefund, error) {
	return uc.repo.GetTotalRefundByID(id)
}
func (uc *RefundUseCase) GetByBusinessID(bid int) ([]entity.TotalRefund, error) {
	return uc.repo.GetTotalRefundsByBusinessID(bid)
}
func (uc *RefundUseCase) GetByPeriod(bid int, start, end time.Time) ([]entity.TotalRefund, error) {
	return uc.repo.GetTotalRefundsByPeriod(bid, start, end)
}
func (uc *RefundUseCase) GetStats(bid int, start, end *time.Time) (entity.RefundStats, error) {
	return uc.repo.GetStats(bid, start, end)
}
func (uc *RefundUseCase) GetItems(totalID int) ([]entity.Refund, error) {
	return uc.repo.GetRefundsByTotalID(totalID)
}

type ExpenseUseCase struct {
	repo     repository.ExpenseRepository
	notifier *notifier.TelegramNotifier
}

func NewExpenseUseCase(r repository.ExpenseRepository, n *notifier.TelegramNotifier) *ExpenseUseCase {
	return &ExpenseUseCase{repo: r, notifier: n}
}
func (uc *ExpenseUseCase) CreateTotalExpense(userID int, req entity.CreateTotalExpenseRequest) (int, error) {
	te := &entity.TotalExpense{BusinessID: req.BusinessID, Total: req.Total, Cash: req.Cash, Card: req.Card, CreatedBy: &userID}
	if req.Description != "" {
		d := req.Description
		te.Description = &d
	}
	id, err := uc.repo.CreateTotalExpense(te)
	if err == nil && uc.notifier != nil {
		desc := ""
		if te.Description != nil {
			desc = *te.Description
		}
		uc.notifier.NotifyExpense(req.BusinessID, req.Total, desc)
	}
	return id, err
}
func (uc *ExpenseUseCase) GetTotalExpensesByBusinessID(bid int) ([]entity.TotalExpense, error) {
	return uc.repo.GetTotalExpensesByBusinessID(bid)
}
func (uc *ExpenseUseCase) GetByPeriod(bid int, start, end time.Time) ([]entity.TotalExpense, error) {
	return uc.repo.GetTotalExpensesByPeriod(bid, start, end)
}
func (uc *ExpenseUseCase) UpdateTotalExpense(id int, req entity.UpdateTotalExpenseRequest) error {
	return uc.repo.UpdateTotalExpense(id, req)
}
func (uc *ExpenseUseCase) DeleteTotalExpense(id int) error {
	return uc.repo.DeleteTotalExpense(id)
}
func (uc *ExpenseUseCase) CreateFixedCost(req entity.CreateFixedCostRequest) (int, error) {
	fc := &entity.FixedCost{BusinessID: req.BusinessID, Amount: req.Amount, Type: req.Type}
	n := req.Name
	fc.Name = &n
	if req.Description != "" {
		d := req.Description
		fc.Description = &d
	}
	return uc.repo.CreateFixedCost(fc)
}
func (uc *ExpenseUseCase) GetFixedCostsByBusinessID(bid int) ([]entity.FixedCost, error) {
	return uc.repo.GetFixedCostsByBusinessID(bid)
}
func (uc *ExpenseUseCase) UpdateFixedCost(id int, req entity.UpdateFixedCostRequest) error {
	return uc.repo.UpdateFixedCost(id, req)
}

type MoneyUseCase struct{ repo repository.MoneyRepository }

func NewMoneyUseCase(r repository.MoneyRepository) *MoneyUseCase { return &MoneyUseCase{repo: r} }
func (uc *MoneyUseCase) Create(req entity.CreateMoneyRequest) (int, error) {
	m := &entity.Money{Value: req.Value, AmountType: req.AmountType, BusinessID: req.BusinessID}
	if req.Description != "" {
		d := req.Description
		m.Description = &d
	}
	return uc.repo.Create(m)
}
func (uc *MoneyUseCase) GetByBusinessID(bid int) ([]entity.Money, error) {
	return uc.repo.GetByBusinessID(bid)
}

type CalculationUseCase struct {
	repo repository.CalculationRepository
}

func NewCalculationUseCase(r repository.CalculationRepository) *CalculationUseCase {
	return &CalculationUseCase{repo: r}
}
func (uc *CalculationUseCase) Create(req entity.CreateCalculationRequest) (int, error) {
	return uc.repo.Create(&entity.Calculation{
		BusinessID: req.BusinessID, TotalIncome: req.TotalIncome, IncomeTax: req.IncomeTax,
		TotalExpense: req.TotalExpense, TotalFixedCosts: req.TotalFixedCosts,
		Salary: req.Salary, SalaryTax: req.SalaryTax, Profit: req.Profit,
		Month: req.Month, Year: req.Year, TotalSale: req.TotalSale, AddedMoney: req.AddedMoney,
	})
}
func (uc *CalculationUseCase) GetByBusinessID(bid int) ([]entity.Calculation, error) {
	return uc.repo.GetByBusinessID(bid)
}
func (uc *CalculationUseCase) GetByPeriod(bid, m, y int) (*entity.Calculation, error) {
	return uc.repo.GetByBusinessIDAndPeriod(bid, m, y)
}

func (uc *CalculationUseCase) GetStats(bid, month, year int) (*entity.CalculationStats, error) {
	return uc.repo.GetStats(bid, month, year)
}

func (uc *CalculationUseCase) GetIncomeBreakdown(bid, month, year int) ([]entity.IncomeBreakdownItem, error) {
	return uc.repo.GetIncomeBreakdown(bid, month, year)
}
func (uc *CalculationUseCase) GetExpenseBreakdown(bid, month, year int) ([]entity.TotalExpense, error) {
	return uc.repo.GetExpenseBreakdown(bid, month, year)
}
func (uc *CalculationUseCase) GetFixedBreakdown(bid int) ([]entity.FixedCost, error) {
	return uc.repo.GetFixedBreakdown(bid)
}

type CashbackTierUseCase struct {
	repo repository.CashbackTierRepository
}

func NewCashbackTierUseCase(r repository.CashbackTierRepository) *CashbackTierUseCase {
	return &CashbackTierUseCase{repo: r}
}

func (uc *CashbackTierUseCase) Create(req entity.CreateCashbackTierRequest) (int, error) {
	// Frontend sends minAmount as alias for minSpend
	minSpend := req.MinSpend
	if minSpend == 0 && req.MinAmount > 0 {
		minSpend = req.MinAmount
	}
	tier := &entity.CashbackTier{
		BusinessID: req.BusinessID,
		Name:       req.Name,
		MinSpend:   minSpend,
		Percentage: req.Percentage,
	}
	return uc.repo.Create(tier)
}

func (uc *CashbackTierUseCase) GetByID(id int) (*entity.CashbackTier, error) {
	return uc.repo.GetByID(id)
}

func (uc *CashbackTierUseCase) GetByBusinessID(bid int) ([]entity.CashbackTier, error) {
	return uc.repo.GetByBusinessID(bid)
}

func (uc *CashbackTierUseCase) Update(id int, req entity.UpdateCashbackTierRequest) error {
	return uc.repo.Update(id, req)
}

func (uc *CashbackTierUseCase) Delete(id int) error {
	return uc.repo.Delete(id)
}
