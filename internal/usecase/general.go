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
		Price: req.Price, Discount: req.Discount, Quantity: req.Quantity,
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
	repo       repository.TransactionRepository
	clientRepo repository.ClientRepository
	notifier   *notifier.TelegramNotifier
}

func NewTransactionUseCase(r repository.TransactionRepository, cr repository.ClientRepository, n *notifier.TelegramNotifier) *TransactionUseCase {
	return &TransactionUseCase{repo: r, clientRepo: cr, notifier: n}
}
func (uc *TransactionUseCase) CreateSale(userID int, req entity.CreateTotalTransactionRequest) (int, error) {
	tt := &entity.TotalTransaction{
		BusinessID: req.BusinessID, ClientID: req.ClientID,
		Total: req.Total, Cash: req.Cash, Card: req.Card, Click: req.Click, Debt: req.Debt,
		CreatedBy: &userID,
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
		t := &entity.Transaction{
			ProductID: item.ProductID, ProductQuantity: item.ProductQuantity,
			ProductPrice: item.ProductPrice, BusinessID: itemBid, TotalTransactionID: totalID,
		}
		if item.Description != "" {
			d := item.Description
			t.Description = &d
		}
		if _, err := uc.repo.CreateTransaction(t); err != nil {
			return 0, err
		}
	}
	if totalID != 0 && uc.notifier != nil {
		// Go tili imkoniyati - "Goroutine (go)": Telegramga xabar yuborish internet tezligiga qarab 
		// sekin bo'lishi mumkin. Mijoz sotuvni saqlashda kutib qolmasligi uchun bu funksiya "go" orqali 
		// zudlik bilan orqa fonda asinxron tarzda ishga tushiriladi va dastur darhol mijozga javob qaytaradi.
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
func (uc *TransactionUseCase) GetItems(totalID int) ([]entity.Transaction, error) {
	return uc.repo.GetTransactionsByTotalID(totalID)
}
func (uc *TransactionUseCase) GetByBusinessIDWithLimit(bid int, limit int) ([]entity.TotalTransaction, error) {
	return uc.repo.GetRecentTransactionsByBusinessID(bid, limit)
}
func (uc *TransactionUseCase) GetByClientIDWithLimit(clientID int, limit int) ([]entity.TotalTransaction, error) {
	return uc.repo.GetRecentTransactionsByClientID(clientID, limit)
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

type RefundUseCase struct {
	repo     repository.RefundRepository
	notifier *notifier.TelegramNotifier
}

func NewRefundUseCase(r repository.RefundRepository, n *notifier.TelegramNotifier) *RefundUseCase {
	return &RefundUseCase{repo: r, notifier: n}
}
func (uc *RefundUseCase) Create(userID int, req entity.CreateTotalRefundRequest) (int, error) {
	tr := &entity.TotalRefund{
		BusinessID: req.BusinessID, ClientID: req.ClientID,
		Total: req.Total, Cash: req.Cash, Card: req.Card, Click: req.Click, Debt: req.Debt,
		CreatedBy: &userID,
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
