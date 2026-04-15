package telegram

import (
	"fmt"
	"log"
	"savdosklad/config"
	"savdosklad/internal/entity"
	"savdosklad/internal/usecase"
	"savdosklad/pkg/i18n"
	"strconv"
	"strings"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type Bot struct {
	api           *tgbotapi.BotAPI
	userUC        *usecase.UserUseCase
	businessUC    *usecase.BusinessUseCase
	productUC     *usecase.ProductUseCase
	transactionUC *usecase.TransactionUseCase
	refundUC      *usecase.RefundUseCase
	expenseUC     *usecase.ExpenseUseCase
	clientUC      *usecase.ClientUseCase
	userLangs     map[int64]string // tgID -> lang
	userStates    map[int64]string // tgID -> state (e.g. "search_client")
	userPayloads  map[int64]string // tgID -> temporary data (e.g. "100.50")
}

func NewBot(cfg config.TelegramConfig,
	userUC *usecase.UserUseCase,
	businessUC *usecase.BusinessUseCase,
	productUC *usecase.ProductUseCase,
	transactionUC *usecase.TransactionUseCase,
	refundUC *usecase.RefundUseCase,
	expenseUC *usecase.ExpenseUseCase,
	clientUC *usecase.ClientUseCase,
) (*Bot, error) {
	api, err := tgbotapi.NewBotAPI(cfg.Token)
	if err != nil {
		return nil, err
	}

	return &Bot{
		api:           api,
		userUC:        userUC,
		businessUC:    businessUC,
		productUC:     productUC,
		transactionUC: transactionUC,
		refundUC:      refundUC,
		expenseUC:     expenseUC,
		clientUC:      clientUC,
		userLangs:     make(map[int64]string),
		userStates:    make(map[int64]string),
		userPayloads:  make(map[int64]string),
	}, nil
}

func (b *Bot) Start() {
	log.Printf("Bot authorized on account %s", b.api.Self.UserName)
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	// Channels (Kanallar): Telegram API orqali kelayotgan xabarlar oqimini (stream)
	// <-chan tgbotapi.Update kanali yordamida qabul qilamiz.
	updates := b.api.GetUpdatesChan(u)

	for update := range updates {
		if update.CallbackQuery != nil {
			b.handleCallback(update.CallbackQuery)
			continue
		}
		if update.Message == nil {
			continue
		}
		if update.Message.IsCommand() {
			b.handleCommand(update.Message)
			continue
		}
		b.handleMessage(update.Message)
	}
}

func (b *Bot) RunScheduler() {
	// Ticker (Vaqt o'lchagich): Har bir minutda signal jo'natib turadigan vosita.
	// Bu orqa fonda vaqtni tekshirib turish uchun ishlatiladi.
	ticker := time.NewTicker(1 * time.Minute)

	// Goroutine (Parallel ishlovchi): Asosiy jarayonni to'xtatib qo'ymaslik uchun
	// scheduler alohida "go" ipining (routine) ichida ishga tushiriladi.
	go func() {
		// Kanalni range orqali o'qish: Ticker signal berganda loop bir marta aylanadi.
		for range ticker.C {
			now := time.Now()
			// Send report at 19:00 (7 PM)
			if now.Hour() == 19 && now.Minute() == 0 {
				b.SendDailyReports()
			}
		}
	}()
}

func (b *Bot) SendDailyReports() {
	users, err := b.userUC.GetAll()
	if err != nil {
		log.Printf("[Bot] Error getting users for reports: %v", err)
		return
	}
	for _, u := range users {
		if u.TelegramUserID != 0 {
			lang := b.getLang(u.TelegramUserID)
			// Yesterday/Today stats
			start := time.Now().Truncate(24 * time.Hour)
			end := time.Now()

			businesses, err := b.businessUC.GetByUserID(u.ID)
			if err != nil {
				log.Printf("[Bot] Error getting businesses for user %d: %v", u.ID, err)
				continue
			}

			var total float64
			for _, biz := range businesses {
				txs, err := b.transactionUC.GetByPeriod(biz.ID, start, end)
				if err != nil {
					log.Printf("[Bot] Error getting txs for biz %d: %v", biz.ID, err)
					continue
				}
				for _, t := range txs {
					total += t.Total
				}
			}

			text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotDailyStatHeader), time.Now().Format("02.01.2006"))
			text += fmt.Sprintf("\n💰 %s", i18n.FormatMoney(total, lang))
			b.sendMessage(u.TelegramUserID, text)
		}
	}
}

func (b *Bot) getLang(tgID int64) string {
	if lang, ok := b.userLangs[tgID]; ok {
		return lang
	}
	user, err := b.userUC.GetByTelegramID(tgID)
	if err == nil && user != nil && user.Language != "" {
		b.userLangs[tgID] = user.Language
		return user.Language
	}
	clients, _ := b.clientUC.GetByTelegramID(tgID)
	if len(clients) > 0 && clients[0].Language != nil && *clients[0].Language != "" {
		b.userLangs[tgID] = *clients[0].Language
		return *clients[0].Language
	}
	return "uz"
}

func (b *Bot) handleCallback(query *tgbotapi.CallbackQuery) {
	tgID := query.From.ID
	data := query.Data
	lang := b.getLang(tgID)

	if strings.HasPrefix(data, "lang_") {
		lang = strings.TrimPrefix(data, "lang_")
		b.userLangs[tgID] = lang
		user, _ := b.userUC.GetByTelegramID(tgID)
		if user != nil {
			_ = b.userUC.UpdateLanguage(user.ID, lang)
		} else {
			clients, _ := b.clientUC.GetByTelegramID(tgID)
			for _, c := range clients {
				_ = b.clientUC.UpdateLanguage(c.ID, lang)
			}
		}
		b.api.Request(tgbotapi.NewCallback(query.ID, "OK"))
		b.api.Request(tgbotapi.NewDeleteMessage(query.Message.Chat.ID, query.Message.MessageID))
		if user != nil {
			b.sendMainMenu(query.Message.Chat.ID, lang)
		} else {
			clients, _ := b.clientUC.GetByTelegramID(tgID)
			if len(clients) > 0 {
				b.sendClientMainMenu(query.Message.Chat.ID, lang)
			} else {
				b.sendLoginPrompt(query.Message.Chat.ID, lang)
			}
		}
	} else if strings.HasPrefix(data, "reply_req_") {
		clientTGID := strings.TrimPrefix(data, "reply_req_")
		b.userStates[tgID] = "staff_replying_req_" + clientTGID
		b.sendMessage(query.Message.Chat.ID, i18n.T(lang, i18n.MsgBotEnterReply))
		b.api.Request(tgbotapi.NewCallback(query.ID, ""))
	} else if strings.HasPrefix(data, "report_") {
		period := strings.TrimPrefix(data, "report_")
		user, _ := b.userUC.GetByTelegramID(tgID)
		if user != nil {
			b.sendPeriodReport(query.Message.Chat.ID, user, lang, period)
		}
		b.api.Request(tgbotapi.NewCallback(query.ID, "OK"))
	} else if strings.HasPrefix(data, "broadcast_biz_") {
		bizIDStr := strings.TrimPrefix(data, "broadcast_biz_")
		b.userPayloads[tgID] = bizIDStr
		b.userStates[tgID] = "broadcast_img"
		b.sendMessage(query.Message.Chat.ID, i18n.T(lang, i18n.MsgBotEnterBroadcastImg))
		b.api.Request(tgbotapi.NewCallback(query.ID, ""))
	} else if data == "broadcast_cancel" {
		delete(b.userStates, tgID)
		b.api.Request(tgbotapi.NewCallback(query.ID, "OK"))
		b.api.Request(tgbotapi.NewDeleteMessage(query.Message.Chat.ID, query.Message.MessageID))
		b.sendMainMenu(query.Message.Chat.ID, lang)
	} else if strings.HasPrefix(data, "expense_biz_") {
		bizIDStr := strings.TrimPrefix(data, "expense_biz_")
		b.userPayloads[tgID] = bizIDStr + "|"
		b.userStates[tgID] = "add_expense_amount"
		b.api.Request(tgbotapi.NewCallback(query.ID, "OK"))
		b.api.Request(tgbotapi.NewDeleteMessage(query.Message.Chat.ID, query.Message.MessageID))
		b.sendMessage(query.Message.Chat.ID, i18n.T(lang, i18n.MsgBotEnterExpenseAmount))
	}
}

func (b *Bot) handleCommand(msg *tgbotapi.Message) {
	lang := b.getLang(msg.From.ID)
	switch msg.Command() {
	case "start":
		b.sendLanguageSelection(msg.Chat.ID)
	case "login":
		b.sendLoginPrompt(msg.Chat.ID, lang)
	case "debug":
		tgID := msg.From.ID
		info := fmt.Sprintf("🔍 Debug Info (TG ID: %d):\n", tgID)

		user, _ := b.userUC.GetByTelegramID(tgID)
		if user != nil {
			phone := "-"
			if user.PhoneNumber != nil {
				phone = *user.PhoneNumber
			}
			info += fmt.Sprintf("\n🏢 Staff Account:\n- User ID: %d\n- Phone: %s\n- Lang: %s\n", user.ID, phone, user.Language)
		} else {
			info += "\n🏢 Staff Account: Not found\n"
		}

		clients, _ := b.clientUC.GetByTelegramID(tgID)
		if len(clients) > 0 {
			info += fmt.Sprintf("\n👤 Client Account:\n- Count: %d\n", len(clients))
			for i, c := range clients {
				debt, _ := b.clientUC.GetTotalDebt(c.ID)
				info += fmt.Sprintf("  %d. %s (BizID: %d), Debt: %s\n", i+1, c.FullName, c.BusinessID, i18n.FormatMoney(debt, lang))
			}
		} else {
			info += "\n👤 Client Account: Not found\n"
		}

		b.sendMessage(msg.Chat.ID, info)
	default:
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBadRequest))
	}
}

func (b *Bot) handleMessage(msg *tgbotapi.Message) {
	tgID := msg.From.ID
	lang := b.getLang(tgID)

	if msg.Contact != nil {
		b.handleContact(msg, lang)
		return
	}

	user, err := b.userUC.GetByTelegramID(tgID)
	if err == nil && user != nil {
		// Staff Menu
		// If it's a main menu command, clear state
		isMenuCommand := false
		menuButtons := []string{
			i18n.T(lang, i18n.MsgBotMenuStats),
			i18n.T(lang, i18n.MsgBotMenuProducts),
			i18n.T(lang, i18n.MsgBotMenuProductsSearch),
			i18n.T(lang, i18n.MsgBotMenuRecentSales),
			i18n.T(lang, i18n.MsgBotMenuBroadcast),
			i18n.T(lang, i18n.MsgBotMenuSales),
			i18n.T(lang, i18n.MsgBotMenuRefunds),
			i18n.T(lang, i18n.MsgBotMenuExpense),
			i18n.T(lang, i18n.MsgBotMenuClients),
			i18n.T(lang, i18n.MsgBotMenuReports),
			i18n.T(lang, i18n.MsgBotMenuProfile),
			i18n.T(lang, i18n.MsgBotMenuChangeLang),
		}
		for _, btn := range menuButtons {
			if msg.Text == btn {
				delete(b.userStates, tgID)
				delete(b.userPayloads, tgID)
				isMenuCommand = true
				break
			}
		}

		if !isMenuCommand {
			if state, ok := b.userStates[tgID]; ok {
				if state == "search_client" {
					b.handleClientSearch(msg, user, lang)
					return
				}
				if strings.HasPrefix(state, "search_product") {
					b.handleProductSearch(msg, user, lang)
					return
				}
				if state == "add_expense_amount" {
					b.handleAddExpenseAmount(msg, lang)
					return
				}
				if state == "add_expense_desc" {
					b.handleAddExpenseDesc(msg, user, lang)
					return
				}
				if strings.HasPrefix(state, "broadcast_img") {
					b.handleBroadcastImg(msg, user, lang)
					return
				}
				if strings.HasPrefix(state, "staff_replying_req_") {
					b.handleStaffReply(msg, user, state, lang)
					return
				}
				if state == "select_expense_biz" {
					b.handleExpenseBizSelection(msg, user, lang)
					return
				}
			}
		}
		switch msg.Text {
		case i18n.T(lang, i18n.MsgBotMenuStats):
			b.sendStatistics(msg.Chat.ID, user, lang)
		case i18n.T(lang, i18n.MsgBotMenuProducts):
			b.sendProductStock(msg.Chat.ID, user, lang)
		case i18n.T(lang, i18n.MsgBotMenuProductsSearch):
			b.userStates[tgID] = "search_product"
			b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterProductSearch))
		case i18n.T(lang, i18n.MsgBotMenuRecentSales):
			b.sendRecentSales(msg.Chat.ID, user, lang)
		case i18n.T(lang, i18n.MsgBotMenuBroadcast):
			businesses, _ := b.businessUC.GetByUserID(user.ID)
			if len(businesses) > 1 {
				b.sendBroadcastBusinessSelection(msg.Chat.ID, businesses, lang)
				return
			}
			b.userStates[tgID] = "broadcast_img"
			b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterBroadcastImg))
		case i18n.T(lang, i18n.MsgBotMenuSales):
			b.sendSalesDetail(msg.Chat.ID, user, lang)
		case i18n.T(lang, i18n.MsgBotMenuRefunds):
			b.sendRefundsDetail(msg.Chat.ID, user, lang)
		case i18n.T(lang, i18n.MsgBotMenuExpense):
			businesses, _ := b.businessUC.GetByUserID(user.ID)
			if len(businesses) > 1 {
				b.sendExpenseBusinessSelection(msg.Chat.ID, businesses, lang)
				return
			}
			if len(businesses) == 1 {
				b.userPayloads[tgID] = fmt.Sprintf("%d|", businesses[0].ID) // Keep bizID in payload
				b.userStates[tgID] = "add_expense_amount"
				b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterExpenseAmount))
			} else {
				b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotNoBusiness))
			}
		case i18n.T(lang, i18n.MsgBotMenuClients):
			b.userStates[tgID] = "search_client"
			b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterSearch))
		case i18n.T(lang, i18n.MsgBotMenuReports):
			b.sendReportsMenu(msg.Chat.ID, lang)
		case i18n.T(lang, i18n.MsgBotMenuProfile):
			phone := ""
			if user.PhoneNumber != nil {
				phone = *user.PhoneNumber
			}
			profile := fmt.Sprintf("%s: %s %s\n📞 Tel: %s", i18n.T(lang, i18n.MsgBotMenuProfile), user.FirstName, user.LastName, phone)
			b.sendMessage(msg.Chat.ID, profile)
		case i18n.T(lang, i18n.MsgBotMenuDebt):
			clients, _ := b.clientUC.GetByTelegramID(tgID)
			if len(clients) > 0 {
				b.sendClientDebt(msg.Chat.ID, clients, lang)
			}
		case i18n.T(lang, i18n.MsgBotMenuChangeLang):
			b.sendLanguageSelection(msg.Chat.ID)
		default:
			b.sendMainMenu(msg.Chat.ID, lang)
		}
		return
	}

	clients, err := b.clientUC.GetByTelegramID(tgID)
	if err == nil && len(clients) > 0 {
		// Customer Menu
		// Clear state on menu click
		isMenuCommand := false
		menuButtons := []string{
			i18n.T(lang, i18n.MsgBotMenuDebt),
			i18n.T(lang, i18n.MsgBotMenuRecentSales),
			i18n.T(lang, i18n.MsgBotMenuProfile),
			i18n.T(lang, i18n.MsgBotBtnSendRequest),
			i18n.T(lang, i18n.MsgBotMenuChangeLang),
		}
		for _, btn := range menuButtons {
			if msg.Text == btn {
				delete(b.userStates, tgID)
				delete(b.userPayloads, tgID)
				isMenuCommand = true
				break
			}
		}

		if !isMenuCommand {
			if state, ok := b.userStates[tgID]; ok {
				if state == "client_sending_request" {
					b.handleClientRequest(msg, clients, lang)
					return
				}
			}
		}

		switch msg.Text {
		case i18n.T(lang, i18n.MsgBotBtnSendRequest):
			b.userStates[tgID] = "client_sending_request"
			b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterRequest))
		case i18n.T(lang, i18n.MsgBotMenuDebt):
			b.sendClientDebt(msg.Chat.ID, clients, lang)
		case i18n.T(lang, i18n.MsgBotMenuRecentSales):
			b.sendClientRecentSales(msg.Chat.ID, clients, lang)
		case i18n.T(lang, i18n.MsgBotMenuProfile):
			c := clients[0]
			profile := fmt.Sprintf("%s: %s\n📞 Tel: %s", i18n.T(lang, i18n.MsgBotMenuProfile), c.FullName, c.Phone)
			b.sendMessage(msg.Chat.ID, profile)
		case i18n.T(lang, i18n.MsgBotMenuChangeLang):
			b.sendLanguageSelection(msg.Chat.ID)
		default:
			b.sendClientMainMenu(msg.Chat.ID, lang)
		}
		return
	}

	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotLoginPrompt))
}

func (b *Bot) sendReportsMenu(chatID int64, lang string) {
	msg := tgbotapi.NewMessage(chatID, i18n.T(lang, i18n.MsgBotMenuReports))
	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("📅 Weekly", "report_weekly"),
			tgbotapi.NewInlineKeyboardButtonData("🗓 Monthly", "report_monthly"),
		),
	)
	msg.ReplyMarkup = keyboard
	b.api.Send(msg)
}

func (b *Bot) sendPeriodReport(chatID int64, user *entity.User, lang, period string) {
	now := time.Now()
	var start time.Time
	periodName := ""

	if period == "weekly" {
		start = now.AddDate(0, 0, -7)
		periodName = "Haftalik"
	} else {
		start = now.AddDate(0, -1, 0)
		periodName = "Oylik"
	}

	businesses, _ := b.businessUC.GetByUserID(user.ID)
	var rev, exp, ref float64

	for _, biz := range businesses {
		txs, _ := b.transactionUC.GetByPeriod(biz.ID, start, now)
		for _, t := range txs {
			rev += t.Total
		}

		exps, _ := b.expenseUC.GetByPeriod(biz.ID, start, now)
		for _, e := range exps {
			exp += e.Total
		}

		refs, _ := b.refundUC.GetByPeriod(biz.ID, start, now)
		for _, r := range refs {
			ref += r.Total
		}
	}

	profit := rev - exp - ref
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotReportsHeader),
		periodName,
		i18n.FormatMoney(rev, lang),
		i18n.FormatMoney(exp, lang),
		i18n.FormatMoney(ref, lang),
		i18n.FormatMoney(profit, lang),
	)
	b.sendMessage(chatID, text)
}

func (b *Bot) handleClientSearch(msg *tgbotapi.Message, user *entity.User, lang string) {
	query := strings.TrimSpace(msg.Text)
	delete(b.userStates, msg.From.ID)

	businesses, err := b.businessUC.GetByUserID(user.ID)
	if err != nil {
		log.Printf("Error getting businesses for user %d: %v\n", user.ID, err)
	}
	if len(businesses) == 0 {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotNoClient))
		return
	}

	foundCount := 0
	listAll := strings.ToLower(query) == "hamma" || strings.ToLower(query) == "all"

	for _, biz := range businesses {
		bizName := ""
		if biz.Name != nil {
			bizName = *biz.Name
		}

		var clients []entity.Client
		var searchErr error

		if listAll {
			clients, searchErr = b.clientUC.GetByBusinessID(biz.ID)
		} else {
			clients, searchErr = b.clientUC.Search(biz.ID, query)
		}

		if searchErr != nil {
			continue
		}

		for _, c := range clients {
			foundCount++
			debt, _ := b.clientUC.GetTotalDebt(c.ID)
			addr := ""
			if c.Address != nil {
				addr = *c.Address
			}
			bizSuffix := ""
			if len(businesses) > 1 {
				bizSuffix = fmt.Sprintf(" (%s)", bizName)
			}
			text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotClientInfo), c.FullName+bizSuffix, c.Phone, addr, i18n.FormatMoney(debt, lang))
			b.sendMessage(msg.Chat.ID, text)
		}
	}

	if foundCount == 0 {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotNoClient))
	}
}

// ... existing helper methods like sendStatistics, handleContact, sendLanguageSelection, etc.
func (b *Bot) sendLanguageSelection(chatID int64) {
	text := "Please select language / Iltimos, tilni tanlang / Пожалуйста, выберите язык:"
	msg := tgbotapi.NewMessage(chatID, text)
	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🇺🇿 O'zbekcha", "lang_uz"),
			tgbotapi.NewInlineKeyboardButtonData("🇺🇿 Ўзбекча", "lang_uz-cyrl"),
		),
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🇷🇺 Русский", "lang_ru"),
			tgbotapi.NewInlineKeyboardButtonData("🇺🇸 English", "lang_en"),
		),
	)
	msg.ReplyMarkup = keyboard
	b.api.Send(msg)
}

func (b *Bot) handleContact(msg *tgbotapi.Message, lang string) {
	phone := msg.Contact.PhoneNumber
	errU := b.userUC.LinkTelegram(phone, msg.From.ID)
	errC := b.clientUC.LinkTelegram(phone, msg.From.ID)

	if errU == nil {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotLoginSuccess))
		b.sendMainMenu(msg.Chat.ID, lang)
	} else if errC == nil {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotLoginSuccess))
		b.sendClientMainMenu(msg.Chat.ID, lang)
	} else {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotLoginError))
	}
}

func (b *Bot) sendStatistics(chatID int64, user *entity.User, lang string) {
	businesses, _ := b.businessUC.GetByUserID(user.ID)
	var revT, expT, refT float64
	var countToday int
	start := time.Now().Truncate(24 * time.Hour)
	end := time.Now()

	for _, biz := range businesses {
		sT, _ := b.transactionUC.GetStats(biz.ID, &start, &end)
		revT += sT.Total
		countToday += sT.Count

		exps, _ := b.expenseUC.GetByPeriod(biz.ID, start, end)
		for _, e := range exps {
			expT += e.Total
		}

		refs, _ := b.refundUC.GetByPeriod(biz.ID, start, end)
		for _, r := range refs {
			refT += r.Total
		}
	}

	profit := revT - expT - refT
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotStatsHeader), len(businesses))
	text += fmt.Sprintf("\n\n📅 %s:", i18n.T(lang, i18n.MsgBotStatsToday))
	text += fmt.Sprintf("\n%s: %s (%d ta)", i18n.T(lang, i18n.MsgBotMenuSales), i18n.FormatMoney(revT, lang), countToday)
	text += fmt.Sprintf("\n%s: %s", i18n.T(lang, i18n.MsgBotMenuExpense), i18n.FormatMoney(expT, lang))
	text += fmt.Sprintf("\n%s: %s", i18n.T(lang, i18n.MsgBotMenuRefunds), i18n.FormatMoney(refT, lang))
	text += fmt.Sprintf("\n\n📈 %s: %s", i18n.T(lang, i18n.MsgBotBalance), i18n.FormatMoney(profit, lang))

	b.sendMessage(chatID, text)
}

func (b *Bot) sendProductStock(chatID int64, user *entity.User, lang string) {
	businesses, _ := b.businessUC.GetByUserID(user.ID)
	var totalProducts int
	var lowStockItems []string
	for _, biz := range businesses {
		products, _ := b.productUC.GetByBusinessID(biz.ID)
		totalProducts += len(products)
		for _, p := range products {
			if p.Quantity <= 5 {
				name := ""
				if p.Name != nil {
					name = *p.Name
				}
				lowStockItems = append(lowStockItems, name)
			}
		}
	}
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotStockHeader), totalProducts, len(lowStockItems))
	if len(lowStockItems) > 0 {
		text += fmt.Sprintf(i18n.T(lang, i18n.MsgBotLowStock), strings.Join(lowStockItems, "\n- "))
	}
	b.sendMessage(chatID, text)
}

func (b *Bot) sendMessage(chatID int64, text string) {
	msg := tgbotapi.NewMessage(chatID, text)
	b.api.Send(msg)
}

func (b *Bot) sendLoginPrompt(chatID int64, lang string) {
	msg := tgbotapi.NewMessage(chatID, i18n.T(lang, i18n.MsgBotLoginPrompt))
	keyboard := tgbotapi.NewReplyKeyboard(tgbotapi.NewKeyboardButtonRow(tgbotapi.NewKeyboardButtonContact(i18n.T(lang, i18n.MsgBotBtnContact))))
	msg.ReplyMarkup = keyboard
	b.api.Send(msg)
}

func (b *Bot) sendMainMenu(chatID int64, lang string) {
	welcomeText := i18n.T(lang, i18n.MsgBotWelcome)
	msg := tgbotapi.NewMessage(chatID, welcomeText)
	msg.ReplyMarkup = b.getMainMenuKeyboard(lang)
	b.api.Send(msg)
}

func (b *Bot) sendClientMainMenu(chatID int64, lang string) {
	welcomeText := i18n.T(lang, i18n.MsgBotClientWelcome)
	msg := tgbotapi.NewMessage(chatID, welcomeText)
	msg.ReplyMarkup = b.getClientMainMenuKeyboard(lang)
	b.api.Send(msg)
}

func (b *Bot) getMainMenuKeyboard(lang string) tgbotapi.ReplyKeyboardMarkup {
	rows := [][]tgbotapi.KeyboardButton{
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuStats)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuProducts)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuProductsSearch)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuBroadcast)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuRecentSales)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuSales)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuRefunds)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuClients)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuExpense)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuProfile)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuReports)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuChangeLang)),
		),
	}
	keyboard := tgbotapi.NewReplyKeyboard(rows...)
	return keyboard
}

func (b *Bot) getClientMainMenuKeyboard(lang string) tgbotapi.ReplyKeyboardMarkup {
	keyboard := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuDebt)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuRecentSales)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuProfile)),
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotBtnSendRequest)),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton(i18n.T(lang, i18n.MsgBotMenuChangeLang)),
		),
	)
	return keyboard
}

func (b *Bot) sendClientDebt(chatID int64, clients []entity.Client, lang string) {
	found := false
	for _, c := range clients {
		debt, _ := b.clientUC.GetTotalDebt(c.ID)
		if debt > 0 {
			biz, _ := b.businessUC.GetByID(c.BusinessID)
			bizName := "Unknown"
			if biz != nil && biz.Name != nil {
				bizName = *biz.Name
			}
			text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotDebtHeader), bizName, i18n.FormatMoney(debt, lang))
			b.sendMessage(chatID, text)
			found = true
		}
	}
	if !found {
		b.sendMessage(chatID, i18n.T(lang, i18n.MsgBotNoDebt))
	}
}

func (b *Bot) handleProductSearch(msg *tgbotapi.Message, user *entity.User, lang string) {
	query := strings.TrimSpace(msg.Text)
	delete(b.userStates, msg.From.ID)

	businesses, _ := b.businessUC.GetByUserID(user.ID)
	foundCount := 0

	for _, biz := range businesses {
		products, _ := b.productUC.Search(biz.ID, query)
		for _, p := range products {
			foundCount++
			name := ""
			if p.Name != nil {
				name = *p.Name
			}
			text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotProductInfo), name, i18n.FormatMoney(p.Price, lang), p.Quantity)
			if len(businesses) > 1 && biz.Name != nil {
				text += fmt.Sprintf("\n🏢 (%s)", *biz.Name)
			}
			b.sendMessage(msg.Chat.ID, text)
		}
	}

	if foundCount == 0 {
		b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotNoProduct))
	}
}

func (b *Bot) sendRecentSales(chatID int64, user *entity.User, lang string) {
	businesses, _ := b.businessUC.GetByUserID(user.ID)
	limit := 10

	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotRecentSalesHeader), limit)
	foundAny := false

	for _, biz := range businesses {
		bizName := "Biznes"
		if biz.Name != nil && *biz.Name != "" {
			bizName = *biz.Name
		}

		txs, _ := b.transactionUC.GetByBusinessIDWithLimit(biz.ID, limit)
		if len(txs) > 0 {
			foundAny = true
			if len(businesses) > 1 {
				text += fmt.Sprintf("\n\n🏪 %s:", bizName)
			}
		}
		for _, t := range txs {
			dateStr := t.CreatedAt.Format("02.01 15:04")
			clientInfo := ""
			if t.ClientName != "" {
				clientInfo = " — " + t.ClientName
			}
			text += fmt.Sprintf("\n🔹 %s: %s (ID:%d)%s", dateStr, i18n.FormatMoney(t.Total, lang), t.ID, clientInfo)
		}
	}

	if !foundAny {
		b.sendMessage(chatID, "Hech qanday ma'lumot topilmadi.")
	} else {
		b.sendMessage(chatID, text)
	}
}

func (b *Bot) sendClientRecentSales(chatID int64, clients []entity.Client, lang string) {
	limit := 5
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotRecentSalesHeader), limit)
	found := false

	for _, c := range clients {
		txs, _ := b.transactionUC.GetByClientIDWithLimit(c.ID, limit)
		for _, t := range txs {
			found = true
			dateStr := t.CreatedAt.Format("02.01 15:04")
			text += fmt.Sprintf(i18n.T(lang, i18n.MsgBotRecentSalesItem), dateStr, i18n.FormatMoney(t.Total, lang), t.ID)
		}
	}

	if !found {
		b.sendMessage(chatID, i18n.T(lang, i18n.MsgBotNoProduct)) // Reuse MsgBotNoProduct or generic found nothing
	} else {
		b.sendMessage(chatID, text)
	}
}

func (b *Bot) handleAddExpenseAmount(msg *tgbotapi.Message, lang string) {
	amountStr := strings.TrimSpace(msg.Text)
	amountStr = strings.ReplaceAll(amountStr, ",", ".") // Fix decimal separator
	var amount float64
	_, err := fmt.Sscanf(amountStr, "%f", &amount)
	if err != nil || amount <= 0 {
		b.sendMessage(msg.Chat.ID, "Iltimos, musbat son kiriting (Masalan: 125000.50):")
		return
	}

	payload := b.userPayloads[msg.From.ID]
	b.userPayloads[msg.From.ID] = payload + amountStr // bizID|amount
	b.userStates[msg.From.ID] = "add_expense_desc"
	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotEnterExpenseDesc))
}

func (b *Bot) handleAddExpenseDesc(msg *tgbotapi.Message, user *entity.User, lang string) {
	desc := strings.TrimSpace(msg.Text)
	payload := b.userPayloads[msg.From.ID]
	parts := strings.Split(payload, "|")
	if len(parts) < 2 {
		b.sendMessage(msg.Chat.ID, "Xatolik yuz berdi / Error occurred")
		delete(b.userStates, msg.From.ID)
		delete(b.userPayloads, msg.From.ID)
		return
	}

	bizID, _ := strconv.Atoi(parts[0])
	var amount float64
	fmt.Sscanf(parts[1], "%f", &amount)

	delete(b.userStates, msg.From.ID)
	delete(b.userPayloads, msg.From.ID)

	_, err := b.expenseUC.CreateTotalExpense(user.ID, entity.CreateTotalExpenseRequest{
		BusinessID:  bizID,
		Total:       amount,
		Cash:        amount, // Default to cash for bot
		Description: desc,
	})

	if err != nil {
		b.sendMessage(msg.Chat.ID, "Xatolik: "+err.Error())
		return
	}

	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotExpenseSuccess))
	b.sendMainMenu(msg.Chat.ID, lang)
}

func (b *Bot) sendSalesDetail(chatID int64, user *entity.User, lang string) {
	businesses, _ := b.businessUC.GetByUserID(user.ID)
	var s entity.TransactionStats
	start := time.Now().Truncate(24 * time.Hour)
	end := time.Now()

	text := i18n.T(lang, i18n.MsgBotSalesDetailHeader)
	foundOverall := false

	for _, biz := range businesses {
		bizName := "Biznes"
		if biz.Name != nil && *biz.Name != "" {
			bizName = *biz.Name
		}
		if len(businesses) > 1 {
			text += fmt.Sprintf("\n\n🏪 %s:", bizName)
		}

		// List of today's sales
		txs, _ := b.transactionUC.GetByPeriod(biz.ID, start, end)
		foundAny := false
		for _, t := range txs {
			foundAny = true
			foundOverall = true
			var payTypes []string
			if t.Cash > 0 {
				payTypes = append(payTypes, i18n.T(lang, i18n.MsgPaymentCash))
			}
			if t.Card > 0 {
				payTypes = append(payTypes, i18n.T(lang, i18n.MsgPaymentCard))
			}
			if t.Click > 0 {
				payTypes = append(payTypes, i18n.T(lang, i18n.MsgPaymentClick))
			}
			if t.Debt > 0 {
				payTypes = append(payTypes, i18n.T(lang, i18n.MsgPaymentDebt))
			}

			clientInfo := t.ClientName
			if clientInfo == "" {
				if t.ClientNumber != nil && *t.ClientNumber != "" {
					clientInfo = *t.ClientNumber
				} else {
					clientInfo = "Begona" // Fallback: Unknown
				}
			}
			text += fmt.Sprintf(i18n.T(lang, i18n.MsgBotSalesDetailListItem), t.ID, i18n.FormatMoney(t.Total, lang), strings.Join(payTypes, ", "), clientInfo)
		}

		if !foundAny {
			text += "\n  Ma'lumot topilmadi"
		}

		bizS, _ := b.transactionUC.GetStats(biz.ID, &start, &end)
		text += fmt.Sprintf("\n  💰 %s: %s (%d ta)\n", i18n.T(lang, i18n.MsgBotMenuSales), i18n.FormatMoney(bizS.Total, lang), bizS.Count)

		s.Total += bizS.Total
		s.Cash += bizS.Cash
		s.Card += bizS.Card
		s.Click += bizS.Click
		s.Debt += bizS.Debt
		s.Count += bizS.Count
	}

	if !foundOverall {
		b.sendMessage(chatID, "Hech qanday ma'lumot topilmadi.")
		return
	}

	if len(businesses) > 1 {
		text += fmt.Sprintf("\n\n---------------------\n📊 Jami:\n\n💰 %s: %s\n💳 %s: %s\n🖱 %s: %s\n📉 %s: %s",
			i18n.T(lang, i18n.MsgPaymentCash), i18n.FormatMoney(s.Cash, lang),
			i18n.T(lang, i18n.MsgPaymentCard), i18n.FormatMoney(s.Card, lang),
			i18n.T(lang, i18n.MsgPaymentClick), i18n.FormatMoney(s.Click, lang),
			i18n.T(lang, i18n.MsgPaymentDebt), i18n.FormatMoney(s.Debt, lang),
		)
	}

	b.sendMessage(chatID, text)
}

func (b *Bot) sendRefundsDetail(chatID int64, user *entity.User, lang string) {
	businesses, _ := b.businessUC.GetByUserID(user.ID)
	var totalOverall float64
	var countOverall int
	start := time.Now().Truncate(24 * time.Hour)
	end := time.Now()

	text := i18n.T(lang, i18n.MsgBotRefundsDetailHeader)
	foundAny := false

	for _, biz := range businesses {
		bizS, _ := b.refundUC.GetStats(biz.ID, &start, &end)
		totalOverall += bizS.Total
		countOverall += bizS.Count

		bizName := "Biznes"
		if biz.Name != nil && *biz.Name != "" {
			bizName = *biz.Name
		}
		if len(businesses) > 1 {
			text += fmt.Sprintf("\n🏪 %s: %s (%d ta)", bizName, i18n.FormatMoney(bizS.Total, lang), bizS.Count)
		}

		// List today's refunds
		refs, _ := b.refundUC.GetByPeriod(biz.ID, start, end)
		for _, r := range refs {
			foundAny = true
			clientInfo := r.ClientName
			if clientInfo == "" {
				clientInfo = i18n.T(lang, i18n.MsgGuest)
			}
			text += fmt.Sprintf("\n  ↩️ ID:%d — %s (%s)", r.ID, i18n.FormatMoney(r.Total, lang), clientInfo)
		}
	}

	if !foundAny && countOverall == 0 {
		b.sendMessage(chatID, "Hech qanday ma'lumot topilmadi.")
	} else {
		if len(businesses) > 1 {
			text += fmt.Sprintf("\n\n📊 Jami: %s (%d ta)", i18n.FormatMoney(totalOverall, lang), countOverall)
		}
		b.sendMessage(chatID, text)
	}
}

func (b *Bot) handleBroadcastImg(msg *tgbotapi.Message, user *entity.User, lang string) {
	if len(msg.Photo) == 0 && msg.Video == nil {
		b.sendMessage(msg.Chat.ID, "Iltimos, rasm yoki video yuboring / Please send an image or video:")
		return
	}

	var fileID string
	var isVideo bool

	if msg.Video != nil {
		fileID = msg.Video.FileID
		isVideo = true
	} else {
		// Get highest resolution photo
		photo := msg.Photo[len(msg.Photo)-1]
		fileID = photo.FileID
	}

	bizIDStr := ""
	if payload, ok := b.userPayloads[msg.From.ID]; ok {
		bizIDStr = payload
	}

	delete(b.userStates, msg.From.ID)
	delete(b.userPayloads, msg.From.ID)

	businesses, _ := b.businessUC.GetByUserID(user.ID)

	// Collect all unique client TG IDs
	clientTGIDs := make(map[int64]bool)
	for _, biz := range businesses {
		// Filter by business if selected
		if bizIDStr != "" && bizIDStr != "all" {
			id, _ := strconv.Atoi(bizIDStr)
			if biz.ID != id {
				continue
			}
		}

		clients, _ := b.clientUC.GetByBusinessID(biz.ID)
		for _, c := range clients {
			if c.TelegramUserID != nil && *c.TelegramUserID != 0 {
				clientTGIDs[*c.TelegramUserID] = true
			}
		}
	}

	sentCount := 0
	for tgID := range clientTGIDs {
		var err error

		if isVideo {
			vidMsg := tgbotapi.NewVideo(tgID, tgbotapi.FileID(fileID))
			if msg.Caption != "" {
				vidMsg.Caption = msg.Caption
			}
			_, err = b.api.Send(vidMsg)
		} else {
			photoMsg := tgbotapi.NewPhoto(tgID, tgbotapi.FileID(fileID))
			if msg.Caption != "" {
				photoMsg.Caption = msg.Caption
			}
			_, err = b.api.Send(photoMsg)
		}

		if err == nil {
			sentCount++
		}
	}

	b.sendMessage(msg.Chat.ID, fmt.Sprintf(i18n.T(lang, i18n.MsgBotBroadcastSuccess), sentCount))
	b.sendMainMenu(msg.Chat.ID, lang)
}

func (b *Bot) handleClientRequest(msg *tgbotapi.Message, clients []entity.Client, lang string) {
	text := msg.Text
	delete(b.userStates, msg.From.ID)

	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotRequestSent))

	for _, c := range clients {
		biz, err := b.businessUC.GetByID(c.BusinessID)
		if err == nil && biz != nil {
			owner, _ := b.userUC.GetByID(biz.UserID)
			if owner != nil && owner.TelegramUserID != 0 {
				notifyText := fmt.Sprintf(i18n.T(b.getLang(owner.TelegramUserID), i18n.MsgBotNewRequest), text)
				notifyText = fmt.Sprintf("👤 %s (%s)\n%s", c.FullName, c.Phone, notifyText)

				notifyMsg := tgbotapi.NewMessage(owner.TelegramUserID, notifyText)
				notifyMsg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(
					tgbotapi.NewInlineKeyboardRow(
						tgbotapi.NewInlineKeyboardButtonData(i18n.T(b.getLang(owner.TelegramUserID), i18n.MsgBotBtnReply), fmt.Sprintf("reply_req_%d", msg.From.ID)),
					),
				)
				b.api.Send(notifyMsg)
			}
		}
	}
}

func (b *Bot) handleStaffReply(msg *tgbotapi.Message, user *entity.User, state string, lang string) {
	clientTGIDStr := strings.TrimPrefix(state, "staff_replying_req_")
	delete(b.userStates, msg.From.ID)

	clientTGID, err := strconv.ParseInt(clientTGIDStr, 10, 64)
	if err != nil {
		b.sendMessage(msg.Chat.ID, "Invalid client ID")
		return
	}

	clientLang := b.getLang(clientTGID)
	prefix := i18n.T(clientLang, i18n.MsgBotReplyFromStaff)

	if len(msg.Photo) > 0 {
		photo := msg.Photo[len(msg.Photo)-1]
		photoMsg := tgbotapi.NewPhoto(clientTGID, tgbotapi.FileID(photo.FileID))
		photoMsg.Caption = fmt.Sprintf(prefix, msg.Caption)
		b.api.Send(photoMsg)
	} else if msg.Video != nil {
		vidMsg := tgbotapi.NewVideo(clientTGID, tgbotapi.FileID(msg.Video.FileID))
		vidMsg.Caption = fmt.Sprintf(prefix, msg.Caption)
		b.api.Send(vidMsg)
	} else if msg.Text != "" {
		replyText := fmt.Sprintf(prefix, msg.Text)
		b.sendMessage(clientTGID, replyText)
	}

	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBotReplySent))
}

func (b *Bot) sendBroadcastBusinessSelection(chatID int64, businesses []entity.Business, lang string) {
	msg := tgbotapi.NewMessage(chatID, i18n.T(lang, i18n.MsgBotSelectBusinessBroadcast))
	var rows [][]tgbotapi.InlineKeyboardButton
	for _, biz := range businesses {
		name := "Biznes"
		if biz.Name != nil {
			name = *biz.Name
		}
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(name, fmt.Sprintf("broadcast_biz_%d", biz.ID)),
		))
	}
	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData(i18n.T(lang, i18n.MsgBotAllBusinesses), "broadcast_biz_all"),
	))
	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData(i18n.T(lang, i18n.MsgBotBtnCancel), "broadcast_cancel"),
	))

	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	b.api.Send(msg)
}

func (b *Bot) sendExpenseBusinessSelection(chatID int64, businesses []entity.Business, lang string) {
	msg := tgbotapi.NewMessage(chatID, i18n.T(lang, i18n.MsgBotSelectBusinessExpense))
	var rows [][]tgbotapi.InlineKeyboardButton
	for _, biz := range businesses {
		name := "Biznes"
		if biz.Name != nil {
			name = *biz.Name
		}
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(name, fmt.Sprintf("expense_biz_%d", biz.ID)),
		))
	}
	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData(i18n.T(lang, i18n.MsgBotBtnCancel), "broadcast_cancel"), // Reuse cancel
	))

	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	b.api.Send(msg)
}

func (b *Bot) handleExpenseBizSelection(msg *tgbotapi.Message, user *entity.User, lang string) {
	// Fallback for non-callback message if any
	b.sendMessage(msg.Chat.ID, i18n.T(lang, i18n.MsgBadRequest))
	b.sendMainMenu(msg.Chat.ID, lang)
}
