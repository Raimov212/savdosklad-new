package i18n

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
)

// Supported languages
const (
	LangUz     = "uz"      // O'zbekcha (lotin)
	LangUzCyrl = "uz-cyrl" // Ўзбекча (кирилл)
	LangRu     = "ru"      // Русский
	LangEn     = "en"      // English
)

var defaultLang = LangUz

// Message keys
const (
	// Auth & Middleware
	MsgAuthHeaderRequired     = "auth_header_required"
	MsgInvalidAuthFormat      = "invalid_auth_format"
	MsgInvalidOrExpiredToken  = "invalid_or_expired_token"
	MsgAccessDeniedCustomer   = "access_denied_customer"
	MsgInvalidCredentials     = "invalid_credentials"
	MsgUsernameAlreadyExists  = "username_already_exists"
	MsgPhoneAlreadyRegistered = "phone_already_registered"
	MsgInvalidPhoneOrPassword = "invalid_phone_or_password"
	MsgSubscriptionExpired    = "subscription_expired"

	// Common
	MsgBadRequest    = "bad_request"
	MsgNotFound      = "not_found"
	MsgInternalError = "internal_error"
	MsgInvalidID     = "invalid_id"
	MsgPaymentCash   = "payment_cash"
	MsgPaymentCard   = "payment_card"
	MsgPaymentClick  = "payment_click"
	MsgPaymentDebt   = "payment_debt"
	MsgCreated       = "created"
	MsgUpdated       = "updated"
	MsgDeleted       = "deleted"
	MsgGuest         = "guest"

	// User
	MsgUserNotFound = "user_not_found"
	MsgClientPhoneIsUser = "client_phone_is_user"

	// Product
	MsgProductNotFound      = "product_not_found"
	MsgInvalidProductID     = "invalid_product_id"
	MsgInsufficientQuantity = "insufficient_quantity"

	// Customer
	MsgCustomerNotFound = "customer_not_found"

	// Cart
	MsgCartItemUpdated = "cart_item_updated"
	MsgCartItemRemoved = "cart_item_removed"
	MsgInvalidItemID   = "invalid_item_id"

	// Address
	MsgAddressUpdated   = "address_updated"
	MsgAddressDeleted   = "address_deleted"
	MsgInvalidAddressID = "invalid_address_id"

	// Bot
	MsgBotWelcome            = "bot_welcome"
	MsgBotSelectLang         = "bot_select_lang"
	MsgBotLoginPrompt        = "bot_login_prompt"
	MsgBotBtnContact         = "bot_btn_contact"
	MsgBotLoginSuccess       = "bot_login_success"
	MsgBotLoginError         = "bot_login_error"
	MsgBotMenuStats          = "bot_menu_stats"
	MsgBotMenuProducts       = "bot_menu_products"
	MsgBotMenuClients        = "bot_menu_clients"
	MsgBotMenuProfile        = "bot_menu_profile"
	MsgBotMenuChangeLang     = "bot_menu_change_lang"
	MsgBotMenuReports        = "bot_menu_reports"
	MsgBotMenuSales          = "bot_menu_sales"
	MsgBotMenuRefunds        = "bot_menu_refunds"
	MsgBotSalesDetail        = "bot_sales_detail"
	MsgBotSalesDetailHeader  = "bot_sales_detail_header"
	MsgBotSalesDetailListItem = "bot_sales_detail_list_item"
	MsgBotRefundsDetail      = "bot_refunds_detail"
	MsgBotStatsHeader        = "bot_stats_header"
	MsgBotStatsToday         = "bot_stats_today"
	MsgBotStatsTotal         = "bot_stats_total"
	MsgBotReportsHeader      = "bot_reports_header"
	MsgBotStockHeader        = "bot_stock_header"
	MsgBotLowStock           = "bot_low_stock"
	MsgBotNoBusiness         = "bot_no_business"
	MsgBotEnterSearch        = "bot_enter_search"
	MsgBotNoClient           = "bot_no_client"
	MsgBotClientInfo         = "bot_client_info"
	MsgBotNotifySale         = "bot_notify_sale"
	MsgBotNotifyRefund       = "bot_notify_refund"
	MsgBotNotifyExpense      = "bot_notify_expense"
	MsgBotMenuDebt           = "bot_menu_debt"
	MsgBotDebtHeader         = "bot_debt_header"
	MsgBotNoDebt             = "bot_no_debt"
	MsgBotClientWelcome      = "bot_client_welcome"
	MsgBotMenuBroadcast      = "bot_menu_broadcast"
	MsgBotEnterBroadcastImg  = "bot_enter_broadcast_img"
	MsgBotEnterBroadcastDesc = "bot_enter_broadcast_desc"
	MsgBotBroadcastConfirm   = "bot_broadcast_confirm"
	MsgBotBroadcastSuccess   = "bot_broadcast_success"
	MsgBotBtnSendAll         = "bot_btn_send_all"
	MsgBotBtnCancel          = "bot_btn_cancel"
	MsgBotBtnSendRequest     = "bot_btn_send_request"
	MsgBotEnterRequest       = "bot_enter_request"
	MsgBotRequestSent        = "bot_request_sent"
	MsgBotNewRequest         = "bot_new_request"
	MsgBotBtnReply           = "bot_btn_reply"
	MsgBotEnterReply         = "bot_enter_reply"
	MsgBotReplySent          = "bot_reply_sent"
	MsgBotReplyFromStaff     = "bot_reply_from_staff"
	MsgBotMenuProductsSearch = "bot_menu_products_search"
	MsgBotMenuRecentSales    = "bot_menu_recent_sales"
	MsgBotEnterProductSearch = "bot_enter_product_search"
	MsgBotNoProduct          = "bot_no_product"
	MsgBotProductInfo        = "bot_product_info"
	MsgBotRecentSalesHeader  = "bot_recent_sales_header"
	MsgBotRecentSalesItem    = "bot_recent_sales_item"
	MsgBotMenuExpense        = "bot_menu_expense"
	MsgBotEnterExpenseAmount = "bot_enter_expense_amount"
	MsgBotEnterExpenseDesc   = "bot_enter_expense_desc"
	MsgBotExpenseSuccess     = "bot_expense_success"
	MsgBotRefundsDetailHeader = "bot_refunds_detail_header"
	MsgBotDailyStatHeader    = "bot_daily_stat_header"
	MsgBotSelectBusinessBroadcast = "bot_select_business_broadcast"
	MsgBotSelectBusinessExpense   = "bot_select_business_expense"
	MsgBotAllBusinesses           = "bot_all_businesses"
	MsgBotBalance                 = "bot_balance"
)

// translations holds all translations: lang -> key -> message
var translations = map[string]map[string]string{
	LangEn: {
		// Auth
		MsgAuthHeaderRequired:     "authorization header required",
		MsgInvalidAuthFormat:      "invalid authorization header format",
		MsgInvalidOrExpiredToken:  "invalid or expired token",
		MsgAccessDeniedCustomer:   "access denied: customer token required",
		MsgInvalidCredentials:     "invalid credentials",
		MsgUsernameAlreadyExists:  "username already exists",
		MsgPhoneAlreadyRegistered: "phone number already registered",
		MsgInvalidPhoneOrPassword: "invalid phone number or password",
		MsgSubscriptionExpired:    "Your subscription has expired. Please contact support to renew.",
		// Common
		MsgBadRequest:    "bad request",
		MsgNotFound:      "not found",
		MsgInternalError: "internal server error",
		MsgInvalidID:     "invalid ID",
		MsgCreated:       "created",
		MsgUpdated:       "updated",
		MsgDeleted:       "deleted",
		MsgPaymentCash:   "Cash",
		MsgPaymentCard:   "Card",
		MsgPaymentClick:  "Click",
		MsgPaymentDebt:   "Debt",
		MsgGuest:         "Guest",
		// User
		MsgUserNotFound: "user not found",
		// Product
		MsgProductNotFound:      "product not found",
		MsgInvalidProductID:     "invalid product ID",
		MsgInsufficientQuantity: "insufficient product quantity",
		// Customer
		MsgCustomerNotFound: "customer not found",
		// Cart
		MsgCartItemUpdated: "cart item updated",
		MsgCartItemRemoved: "item removed from cart",
		MsgInvalidItemID:   "invalid item ID",
		// Address
		MsgAddressUpdated:   "address updated",
		MsgAddressDeleted:   "address deleted",
		MsgInvalidAddressID: "invalid address ID",
		// Bot
		MsgBotWelcome:            "Welcome to SavdoSklad system bot!\n\nSavdoSklad is a business management system (ERP), primarily designed for sales and warehouse (stock) management.",
		MsgBotSelectLang:         "Please select language:",
		MsgBotLoginPrompt:        "Please send your phone number to login (click button below).",
		MsgBotBtnContact:         "📱 Share Contact",
		MsgBotLoginSuccess:       "Successfully logged in! You can now use the bot.",
		MsgBotLoginError:         "Error: User with this phone number not found.",
		MsgBotMenuStats:          "📊 Statistics",
		MsgBotMenuProducts:       "📦 Products",
		MsgBotMenuClients:        "👥 Clients",
		MsgBotMenuProfile:        "👤 Profile",
		MsgBotMenuChangeLang:     "🌐 Change Language",
		MsgBotMenuReports:        "💰 Reports",
		MsgBotMenuSales:          "🛍 Sales",
		MsgBotMenuRefunds:        "🔄 Refunds",
		MsgBotSalesDetailHeader:  "📊 Sales (Today):\n",
		MsgBotSalesDetailListItem: "\n🆔 %d - %s (%s) 👤 %s",
		MsgBotSalesDetail:        "\n\n---------------------\n📊 Overall Summary:\n\n💰 Cash: %s\n💳 Card: %s\n🖱 Click: %s\n📉 Debt: %s\n\n🛍 Total: %s (%d items)",
		MsgBotRefundsDetail:      "🔄 Refunds Details (Today):\n\n💰 Total: %s\n📝 Count: %d",
		MsgBotStatsHeader:        "📊 Statistics:\n\n🏢 Businesses: %d",
		MsgBotStatsToday:         "Today",
		MsgBotStatsTotal:         "Total",
		MsgBotBalance:           "Balance (Net)",
		MsgBotReportsHeader:      "💰 %s report:\n\n💵 Revenue: %s\n💸 Expenses: %s\n📉 Refunds: %s\n📈 Net Profit: %s",
		MsgBotStockHeader:        "📦 Stock status:\n\n🛍 Total products: %d\n⚠️ Low stock: %d",
		MsgBotLowStock:           "\n\nLow stock products: \n- %s",
		MsgBotNoBusiness:         "You don't have any businesses yet.",
		MsgBotEnterSearch:        "🔍 Please enter customer's name or phone number:",
		MsgBotNoClient:           "No clients found matching your request.",
		MsgBotClientInfo:         "👤 Client: %s\n📞 Phone: %s\n🏠 Address: %s\n💰 Total debt: %s",
		MsgBotNotifySale:         "🔔 NEW SALE!\n🏢 Business: %s\n💰 Amount: %s\n📝 Items: %d",
		MsgBotNotifyRefund:       "🔔 REFUND!\n🏢 Business: %s\n💰 Amount: %s",
		MsgBotNotifyExpense:      "🔔 NEW EXPENSE!\n🏢 Business: %s\n💰 Amount: %s\n📝 Category: %s",
		MsgBotMenuDebt:           "⚖️ My Debt",
		MsgBotDebtHeader:         "📊 Your debt status:\n\n🏢 Business: %s\n💰 Debt: %s",
		MsgBotNoDebt:             "You have no debt in any business. 🎉",
		MsgBotClientWelcome:      "Welcome! You are registered as a customer in our system.",
		MsgBotBtnSendRequest:     "✉️ Send Request",
		MsgBotEnterRequest:       "✏️ Please enter your request or question:",
		MsgBotRequestSent:        "✅ Your request has been sent to the store. We will reply shortly.",
		MsgBotNewRequest:         "📩 New request from client:\n\n%s",
		MsgBotBtnReply:           "✍️ Reply",
		MsgBotEnterReply:         "✏️ Please enter your reply:",
		MsgBotReplySent:          "✅ Your reply has been sent.",
		MsgBotReplyFromStaff:     "📝 Reply from store:\n\n%s",
		MsgBotMenuProductsSearch: "🔍 Product Search",
		MsgBotMenuRecentSales:    "📄 Recent Sales",
		MsgBotEnterProductSearch: "📦 Enter product name or barcode:",
		MsgClientPhoneIsUser:     "❌ This phone number belongs to a staff member and cannot be added as a client",
		MsgBotNoProduct:          "No products found matching your request.",
		MsgBotProductInfo:        "📦 Product: %s\n💰 Price: %s\n🛍 Qty: %d",
		MsgBotRecentSalesHeader:  "📄 Last %d sales:\n",
		MsgBotRecentSalesItem:    "\n- %s: %s (id:%d)",
		MsgBotMenuExpense:        "💸 Add Expense",
		MsgBotEnterExpenseAmount: "💸 Enter amount:",
		MsgBotEnterExpenseDesc:   "📝 Enter description:",
		MsgBotExpenseSuccess:     "Expense successfully saved!",
		MsgBotDailyStatHeader:    "Daily report for %s:",
		MsgBotSelectBusinessBroadcast: "To which business's clients do you want to broadcast the message?",
		MsgBotSelectBusinessExpense:   "For which business do you want to add an expense?",
		MsgBotAllBusinesses:           "All businesses",
		MsgBotMenuBroadcast:      "📢 Broadcast",
		MsgBotEnterBroadcastImg:  "🖼️ Please send an image or video for the broadcast:",
		MsgBotEnterBroadcastDesc: "📝 Please enter the description/caption:",
		MsgBotBroadcastConfirm:   "⚠️ Are you sure you want to send this to %d clients?",
		MsgBotBroadcastSuccess:   "✅ Broadcast sent successfully to %d clients!",
		MsgBotBtnSendAll:         "🚀 Send Now",
		MsgBotBtnCancel:          "❌ Cancel",
		MsgBotRefundsDetailHeader: "🔄 Refunds Details (Today):\n",
	},
	LangUz: {
		// Auth
		MsgAuthHeaderRequired:     "avtorizatsiya headeri talab qilinadi",
		MsgInvalidAuthFormat:      "noto'g'ri avtorizatsiya header formati",
		MsgInvalidOrExpiredToken:  "noto'g'ri yoki muddati o'tgan token",
		MsgAccessDeniedCustomer:   "ruxsat berilmadi: xaridor tokeni talab qilinadi",
		MsgInvalidCredentials:     "noto'g'ri foydalanuvchi nomi yoki parol",
		MsgUsernameAlreadyExists:  "bunday foydalanuvchi nomi allaqachon mavjud",
		MsgPhoneAlreadyRegistered: "bu telefon raqam allaqachon ro'yxatdan o'tgan",
		MsgInvalidPhoneOrPassword: "noto'g'ri telefon raqam yoki parol",
		MsgSubscriptionExpired:    "Sizning obunangiz muddati tugagan. Davom ettirish uchun iltimos administrator bilan bog'laning.",
		// Common
		MsgBadRequest:    "noto'g'ri so'rov",
		MsgNotFound:      "topilmadi",
		MsgInternalError: "ichki server xatosi",
		MsgInvalidID:     "noto'g'ri ID",
		MsgCreated:       "yaratildi",
		MsgUpdated:       "yangilandi",
		MsgDeleted:       "o'chirildi",
		MsgPaymentCash:   "Naqd",
		MsgPaymentCard:   "Karta",
		MsgPaymentClick:  "Click",
		MsgPaymentDebt:   "Qarz",
		MsgGuest:         "Begona xaridor",
		// User
		MsgUserNotFound: "foydalanuvchi topilmadi",
		// Product
		MsgProductNotFound:      "mahsulot topilmadi",
		MsgInvalidProductID:     "noto'g'ri mahsulot ID",
		MsgInsufficientQuantity: "mahsulot miqdori yetarli emas",
		// Customer
		MsgCustomerNotFound: "xaridor topilmadi",
		// Cart
		MsgCartItemUpdated: "savat elementi yangilandi",
		MsgCartItemRemoved: "mahsulot savatdan olib tashlandi",
		MsgInvalidItemID:   "noto'g'ri element ID",
		// Address
		MsgAddressUpdated:   "manzil yangilandi",
		MsgAddressDeleted:   "manzil o'chirildi",
		MsgInvalidAddressID: "noto'g'ri manzil ID",
		// Bot
		MsgBotWelcome:            "SavdoSklad tizimi botiga xush kelibsiz!\n\nSavdoSklad — bu biznes boshqaruv tizimi (ERP), asosan savdo va ombor (sklad) boshqarish uchun mo'ljallangan.",
		MsgBotSelectLang:         "Iltimos, tilni tanlang:",
		MsgBotLoginPrompt:        "Tizimga kirish uchun telefon raqamingizni yuboring (pastdagi tugmani bosing).",
		MsgBotBtnContact:         "📱 Telefon raqamni ulash",
		MsgBotLoginSuccess:       "Muvaffaqiyatli kirdingiz! Botdan foydalanishingiz mumkin.",
		MsgBotLoginError:         "Xatolik: Bunday telefon raqamli foydalanuvchi topilmadi.",
		MsgBotMenuStats:          "📊 Statistika",
		MsgBotMenuProducts:       "📦 Mahsulotlar",
		MsgBotMenuClients:        "👥 Mijozlar",
		MsgBotMenuProfile:        "👤 Profil",
		MsgBotMenuChangeLang:     "🌐 Tilni o'zgartirish",
		MsgBotMenuReports:        "💰 Hisobotlar",
		MsgBotMenuSales:          "🛍 Sotuvlar",
		MsgBotMenuRefunds:        "🔄 Qaytarishlar",
		MsgBotSalesDetailHeader:  "📊 Sotuvlar (Bugun):\n",
		MsgBotSalesDetailListItem: "\n🆔 %d - %s (%s) 👤 %s",
		MsgBotSalesDetail:        "\n\n---------------------\n📊 Umumiy tafsilot:\n\n💰 Naqd: %s\n💳 Karta: %s\n🖱 Click: %s\n📉 Qarz: %s\n\n🛍 Jami: %s (%d ta)",
		MsgBotRefundsDetail:      "🔄 Qaytarishlar tafsiloti (Bugun):\n\n💰 Jami: %s\n📝 Soni: %d ta",
		MsgBotStatsHeader:        "📊 Statistika:\n\n🏢 Bizneslar soni: %d ta",
		MsgBotStatsToday:         "Bugun",
		MsgBotStatsTotal:         "Jami",
		MsgBotBalance:           "Balans (Sof foyda)",
		MsgBotReportsHeader:      "💰 %s hisobot:\n\n💵 Tushum: %s\n💸 Xarajat: %s\n📉 Qaytishlar: %s\n📈 Sof foyda: %s",
		MsgBotStockHeader:        "📦 Ombor holati:\n\n🛍 Jami mahsulotlar: %d ta\n⚠️ Kam qolganlar: %d ta",
		MsgBotLowStock:           "\n\nKam qolgan mahsulotlar: \n- %s",
		MsgBotNoBusiness:         "Sizda hali biznes mavjud emas.",
		MsgBotEnterSearch:        "🔍 Mijoz ismi yoki telefon raqamini kiriting:",
		MsgBotNoClient:           "Sizning so'rovingiz bo'yicha mijoz topilmadi.",
		MsgBotClientInfo:         "👤 Mijoz: %s\n📞 Tel: %s\n🏠 Manzil: %s\n💰 Jami qarz: %s",
		MsgBotNotifySale:         "🔔 YANGI SAVDO!\n🏢 Biznes: %s\n💰 Summa: %s\n📝 Tovarlar soni: %d ta",
		MsgBotNotifyRefund:       "🔔 QAYTARISH!\n🏢 Biznes: %s\n💰 Summa: %s",
		MsgBotNotifyExpense:      "🔔 XARAJAT!\n🏢 Biznes: %s\n💰 Summa: %s\n📝 Tur: %s",
		MsgBotMenuDebt:           "⚖️ Qarzdorligim",
		MsgBotDebtHeader:         "📊 Sizning qarzingiz holati:\n\n🏢 Biznes: %s\n💰 Qarz: %s",
		MsgBotNoDebt:             "Sizning hech qaysi biznesdan qarzingiz yo'q. 🎉",
		MsgBotClientWelcome:      "Xush kelibsiz! Siz tizimimizda mijoz sifatida ro'yxatga olingansiz.",
		MsgBotBtnSendRequest:     "✉️ So'rov yuborish",
		MsgBotEnterRequest:       "✏️ Iltimos, so'rov yoki savolingizni yozing:",
		MsgBotRequestSent:        "✅ So'rovingiz do'konga yuborildi. Tez orada javob beramiz.",
		MsgBotNewRequest:         "📩 Mijozdan yangi so'rov:\n\n%s",
		MsgBotBtnReply:           "✍️ Javob yozish",
		MsgBotEnterReply:         "✏️ Iltimos, mijozga javobingizni yozing:",
		MsgBotReplySent:          "✅ Javobingiz yuborildi.",
		MsgBotReplyFromStaff:     "📝 Do'kondan javob:\n\n%s",
		MsgBotMenuProductsSearch: "🔍 Mahsulot qidirish",
		MsgBotMenuRecentSales:    "📄 So'nggi savdolar",
		MsgBotEnterProductSearch: "📦 Mahsulot nomi yoki kodini kiriting:",
		MsgClientPhoneIsUser:     "❌ Ushbu telefon raqami xodimga tegishli va uni mijoz sifatida qo'shib bo'lmaydi",
		MsgBotNoProduct:          "Mahsulot topilmadi.",
		MsgBotProductInfo:        "📦 Mahsulot: %s\n💰 Narxi: %s\n🛍 Miqdori: %d ta",
		MsgBotRecentSalesHeader:  "📄 Oxirgi %d ta savdo:\n",
		MsgBotRecentSalesItem:    "\n- %s: %s (id:%d)",
		MsgBotMenuExpense:        "💸 Xarajat qo'shish",
		MsgBotEnterExpenseAmount: "💸 Summani kiriting:",
		MsgBotEnterExpenseDesc:   "📝 Izoh kiriting:",
		MsgBotExpenseSuccess:     "Xarajat muvaffaqiyatli saqlandi!",
		MsgBotDailyStatHeader:    "%s kungi kunlik hisobot:",
		MsgBotSelectBusinessBroadcast: "Xabarni qaysi biznes mijozlariga tarqatmoqchisiz?",
		MsgBotSelectBusinessExpense:   "Qaysi biznes uchun xarajat qo'shmoqchisiz?",
		MsgBotAllBusinesses:           "Barcha bizneslar",
		MsgBotMenuBroadcast:      "📢 Tarqatish",
		MsgBotEnterBroadcastImg:  "🖼️ Reklama uchun rasm yoki video yuboring:",
		MsgBotEnterBroadcastDesc: "📝 Reklama matnini (izohini) kiriting:",
		MsgBotBroadcastConfirm:   "⚠️ Ushbu xabarni %d ta mijozga yuborishga ishonchingiz komilmi?",
		MsgBotBroadcastSuccess:   "✅ Xabar %d ta mijozga muvaffaqiyatli yuborildi!",
		MsgBotBtnSendAll:         "🚀 Hozir yuborish",
		MsgBotBtnCancel:          "❌ Bekor qilish",
		MsgBotRefundsDetailHeader: "🔄 Qaytarishlar tafsiloti (Bugun):\n",
	},
	LangUzCyrl: {
		// Auth
		MsgAuthHeaderRequired:     "авторизация ҳеадери талаб қилинади",
		MsgInvalidAuthFormat:      "нотўғри авторизация ҳеадер формати",
		MsgInvalidOrExpiredToken:  "нотўғри ёки муддати ўтган токен",
		MsgAccessDeniedCustomer:   "рухсат берилмади: харидор токени талаб қилинади",
		MsgInvalidCredentials:     "нотўғри фойдаланувчи номи ёки парол",
		MsgUsernameAlreadyExists:  "бундай фойдаланувчи номи аллақачон мавжуд",
		MsgPhoneAlreadyRegistered: "бу телефон рақам аллақачон рўйхатдан ўтган",
		MsgInvalidPhoneOrPassword: "нотўғри телефон рақам ёки парол",
		MsgSubscriptionExpired:    "Сизning обунангиз муддати тугаган. Давом эттириш учун илтимос администратор билан боғланинг.",
		// Common
		MsgBadRequest:    "нотўғри сўров",
		MsgNotFound:      "топилмади",
		MsgInternalError: "ички сервер хатоси",
		MsgInvalidID:     "нотўғри ID",
		MsgCreated:       "яратилди",
		MsgUpdated:       "янгиланди",
		MsgDeleted:       "ўчирилди",
		MsgPaymentCash:   "Нақд",
		MsgPaymentCard:   "Карта",
		MsgPaymentClick:  "Click",
		MsgPaymentDebt:   "Қарз",
		MsgGuest:         "Бегона харидор",
		// User
		MsgUserNotFound: "фойдаланувчи топилмади",
		// Product
		MsgProductNotFound:      "маҳсулот топилмади",
		MsgInvalidProductID:     "нотўғри маҳсулот ID",
		MsgInsufficientQuantity: "маҳсулот миқдори етарли эмас",
		// Customer
		MsgCustomerNotFound: "харидор топилмади",
		// Cart
		MsgCartItemUpdated: "сават элементи янгиланди",
		MsgCartItemRemoved: "маҳсулот саватдан олиб ташланди",
		MsgInvalidItemID:   "нотўғри элемент ID",
		// Address
		MsgAddressUpdated:   "манзил янгиланди",
		MsgAddressDeleted:   "манзил ўчирилди",
		MsgInvalidAddressID: "нотўғри манзил ИД",
		// Bot
		MsgBotWelcome:            "SavdoSklad тизими ботига хуш келибсиз!\n\nSavdoSklad — бу бизнес бошқарув тизими (ERP), асосан савдо ва омбор (склад) бошқариш учун мўлжалланган.",
		MsgBotSelectLang:         "Илтимос, тилни танланг:",
		MsgBotLoginPrompt:        "Тизимга кириш учун телефон рақамингизни юборинг (пастдаги тугмани босинг).",
		MsgBotBtnContact:         "📱 Телефон рақамни улаш",
		MsgBotLoginSuccess:       "Муваффақиятли кирдингиз! Ботдан фойдаланишингиз мумкин.",
		MsgBotLoginError:         "Хатолик: Бундай телефон рақамли фойдаланувчи топилмади.",
		MsgBotMenuStats:          "📊 Статистика",
		MsgBotMenuProducts:       "📦 Маҳсулотлар",
		MsgBotMenuClients:        "👥 Мижозлар",
		MsgBotMenuProfile:        "👤 Профил",
		MsgBotMenuChangeLang:     "🌐 Тилни ўзгартириш",
		MsgBotStatsHeader:        "📊 Статистика:\n\n🏢 Бизнеслар сони: %d та",
		MsgBotStatsToday:         "Бугун",
		MsgBotStatsTotal:         "Жами",
		MsgBotBalance:           "Баланс (Соф фойда)",
		MsgBotStockHeader:        "📦 Омбор ҳолати:\n\n🛍 Жами маҳсулотлар: %d та\n⚠️ Кам қолганлар: %d та",
		MsgBotLowStock:           "\n\nКам қолган маҳсулотлар: \n- %s",
		MsgBotMenuDebt:           "⚖️ Қарздорлигим",
		MsgBotDebtHeader:         "📊 Сизнинг қарзингиз ҳолати:\n\n🏢 Бизнес: %s\n💰 Қарз: %s",
		MsgBotNoDebt:             "Сизнинг ҳеч қайси бизнесдан қарзингиз йўқ. 🎉",
		MsgBotClientWelcome:      "Хуш келибсиз! Сиз тизимимизда мижоз сифатида рўйхатга олингансиз.",
		MsgBotMenuReports:        "💰 Ҳисоботлар",
		MsgBotMenuSales:          "🛍 Сотувлар",
		MsgBotMenuRefunds:        "🔄 Қайтаришлар",
		MsgBotSalesDetailHeader:  "📊 Сотувлар (Бугун):\n",
		MsgBotSalesDetailListItem: "\n🆔 %d - %s (%s) 👤 %s",
		MsgBotSalesDetail:        "\n\n---------------------\n📊 Умумий тафсилот:\n\n💰 Нақд: %s\n💳 Карта: %s\n🖱 Click: %s\n📉 Қарз: %s\n\n🛍 Жами: %s (%d та)",
		MsgBotRefundsDetail:      "🔄 Қайтаришлар тафсилоти (Бугун):\n\n💰 Жами: %s\n📝 Сони: %d та",
		MsgBotReportsHeader:      "💰 %s ҳисобот:\n\n💵 Тушум: %s\n💸 Харажат: %s\n📉 Қайтишлар: %s\n📈 Соф фойда: %s",
		MsgBotEnterSearch:        "🔍 Мижоз исми ёки телефон рақамини киритинг:",
		MsgBotNoClient:           "Сизнинг сўровингиз бўйича мижоз топилмади.",
		MsgBotClientInfo:         "👤 Мижоз: %s\n📞 Тел: %s\n🏠 Манзил: %s\n💰 Жами қарз: %s",
		MsgBotNotifySale:         "🔔 ЯНГИ САВДО!\n🏢 Бизнес: %s\n💰 Сумма: %s\n📝 Товарлар сони: %d та",
		MsgBotNotifyRefund:       "🔔 ҚАЙТАРИШ!\n🏢 Бизнес: %s\n💰 Сумма: %s",
		MsgBotNotifyExpense:      "🔔 ХАРАЖАТ!\n🏢 Бизнес: %s\n💰 Сумма: %s\n📝 Тур: %s",
		MsgBotBtnSendRequest:     "✉️ Сўров юбориш",
		MsgBotEnterRequest:       "✏️ Илтимос, сўров ёки саволингизни ёзинг:",
		MsgBotRequestSent:        "✅ Сўровингиз дўконга юборилди. Тез орада жавоб берамиз.",
		MsgBotNewRequest:         "📩 Мижоздан янги сўров:\n\n%s",
		MsgBotBtnReply:           "✍️ Жавоб ёзиш",
		MsgBotEnterReply:         "✏️ Илтимос, мижозга жавобингизни ёзинг:",
		MsgBotReplySent:          "✅ Жавобингиз юборилди.",
		MsgBotReplyFromStaff:     "📝 Дўкондан жавоб:\n\n%s",
		MsgBotMenuProductsSearch: "🔍 Маҳсулот қидириш",
		MsgBotMenuRecentSales:    "📄 Сўнгги савдолар",
		MsgBotEnterProductSearch: "📦 Маҳсулот номи ёки кодини киритинг:",
		MsgClientPhoneIsUser:     "❌ Ушбу телефон рақами ходимга тегишли ва уни мижоз сифатида қўшиб бўлмайди",
		MsgBotNoProduct:          "Маҳсулот топилмади.",
		MsgBotProductInfo:        "📦 Маҳсулот: %s\n💰 Нархи: %s\n🛍 Миқдори: %d та",
		MsgBotRecentSalesHeader:  "📄 Охирги %d та савдо:\n",
		MsgBotRecentSalesItem:    "\n- %s: %s (id:%d)",
		MsgBotMenuExpense:        "💸 Харажат қўшиш",
		MsgBotEnterExpenseAmount: "💸 Суммани киритинг:",
		MsgBotEnterExpenseDesc:   "📝 Изоҳ киритинг:",
		MsgBotExpenseSuccess:     "Харажат муваффақиятли сақланди!",
		MsgBotDailyStatHeader:    "%s кунги кунлик ҳисобот:",
		MsgBotSelectBusinessBroadcast: "Хабарни қайси бизнес мижозларига тарқатмоқчисиз?",
		MsgBotSelectBusinessExpense:   "Қайси бизнес учун харажат қўшмоқчисиз?",
		MsgBotAllBusinesses:           "Барча бизнеслар",
		MsgBotMenuBroadcast:      "📢 Тарқатиш",
		MsgBotEnterBroadcastImg:  "🖼️ Реклама учун расм ёки видео юборинг:",
		MsgBotEnterBroadcastDesc: "📝 Реклама матнини (изоҳини) киритинг:",
		MsgBotBroadcastConfirm:   "⚠️ Ушбу хабарни %d та мижозга юборишга ишончингиз комилми?",
		MsgBotBroadcastSuccess:   "✅ Хабар %d та мижозга муваффақиятли юборилди!",
		MsgBotBtnSendAll:         "🚀 Ҳозир юбориш",
		MsgBotBtnCancel:          "❌ Бекор қилиш",
		MsgBotRefundsDetailHeader: "🔄 Қайтаришлар тафсилоти (Бугун):\n",
	},
	LangRu: {
		// Auth
		MsgAuthHeaderRequired:     "требуется заголовок авторизации",
		MsgInvalidAuthFormat:      "неверный формат заголовка авторизации",
		MsgInvalidOrExpiredToken:  "недействительный или просроченный токен",
		MsgAccessDeniedCustomer:   "доступ запрещён: требуется токен покупателя",
		MsgInvalidCredentials:     "неверное имя пользователя или пароль",
		MsgUsernameAlreadyExists:  "такое имя пользователя уже существует",
		MsgPhoneAlreadyRegistered: "этот номер телефона уже зарегистрирован",
		MsgInvalidPhoneOrPassword: "неверный номер телефона или пароль",
		MsgSubscriptionExpired:    "Срок вашей подписки истек. Пожалуйста, свяжитесь с поддержкой для продления.",
		// Common
		MsgBadRequest:    "неверный запрос",
		MsgNotFound:      "не найдено",
		MsgInternalError: "внутренняя ошибка сервера",
		MsgInvalidID:     "неверный ID",
		MsgCreated:       "создано",
		MsgUpdated:       "обновлено",
		MsgDeleted:       "удалено",
		MsgPaymentCash:   "Наличные",
		MsgPaymentCard:   "Карта",
		MsgPaymentClick:  "Click",
		MsgPaymentDebt:   "Долг",
		MsgGuest:         "Гость",
		// User
		MsgUserNotFound: "пользователь не найден",
		// Product
		MsgProductNotFound:      "товар не найден",
		MsgInvalidProductID:     "неверный ID товара",
		MsgInsufficientQuantity: "недостаточное количество товара",
		// Customer
		MsgCustomerNotFound: "покупатель не найден",
		// Cart
		MsgCartItemUpdated: "элемент корзины обновлён",
		MsgCartItemRemoved: "товар удалён из корзины",
		MsgInvalidItemID:   "неверный ID элемента",
		// Address
		MsgAddressUpdated:   "адрес обновлён",
		MsgAddressDeleted:   "адрес удалён",
		MsgInvalidAddressID: "неверный ID адреса",
		// Bot
		MsgBotWelcome:            "Добро пожаловать в бот системы SavdoSklad!\n\nSavdoSklad — это система управления бизнесом (ERP), предназначенная в основном для управления торговлей и складом.",
		MsgBotSelectLang:         "Пожалуйста, выберите язык:",
		MsgBotLoginPrompt:        "Для входа в систему отправьте свой номер телефона (нажмите кнопку ниже).",
		MsgBotBtnContact:         "📱 Поделиться контактом",
		MsgBotLoginSuccess:       "Вы успешно вошли! Теперь вы можете использовать бота.",
		MsgBotLoginError:         "Ошибка: Пользователь с таким номером телефона не найден.",
		MsgBotMenuStats:          "📊 Статистика",
		MsgBotMenuProducts:       "📦 Товары",
		MsgBotMenuClients:        "👥 Клиенты",
		MsgBotMenuProfile:        "👤 Профиль",
		MsgBotMenuChangeLang:     "🌐 Сменить язык",
		MsgBotStatsHeader:        "📊 Статистика:\n\n🏢 Кол-во бизнесов: %d",
		MsgBotStatsToday:         "Сегодня",
		MsgBotStatsTotal:         "Всего",
		MsgBotBalance:           "Баланс (Прибыль)",
		MsgBotStockHeader:        "📦 Состояние склада:\n\n🛍 Всего товаров: %d\n⚠️ Мало в наличии: %d",
		MsgBotLowStock:           "\n\nТовары, которых мало: \n- %s",
		MsgBotNoBusiness:         "У вас пока нет бизнесов.",
		MsgBotMenuDebt:           "⚖️ Мой долг",
		MsgBotDebtHeader:         "📊 Состояние вашего долга:\n\n🏢 Бизнес: %s\n💰 Долг: %s",
		MsgBotNoDebt:             "У вас нет долгов ни в одном бизнесе. 🎉",
		MsgBotClientWelcome:      "Добро пожаловать! Вы зарегистрированы как клиент в нашей системе.",
		MsgBotMenuReports:        "💰 Отчеты",
		MsgBotMenuSales:          "🛍 Продажи",
		MsgBotMenuRefunds:        "🔄 Возвраты",
		MsgBotSalesDetailHeader:  "📊 Продажи (Сегодня):\n",
		MsgBotSalesDetailListItem: "\n🆔 %d - %s (%s) 👤 %s",
		MsgBotSalesDetail:        "\n\n---------------------\n📊 Общая сводка:\n\n💰 Наличные: %s\n💳 Карта: %s\n🖱 Сlick: %s\n📉 Долг: %s\n\n🛍 Итого: %s (%d шт)",
		MsgBotRefundsDetail:      "🔄 Детали возвратов (Сегодня):\n\n💰 Итого: %s\n📝 Кол-во: %d",
		MsgBotReportsHeader:      "💰 %s отчет:\n\n💵 Выручка: %s\n💸 Расходы: %s\n📉 Возвраты: %s\n📈 Чистая прибыль: %s",
		MsgBotEnterSearch:        "🔍 Введите имя или телефон клиента:",
		MsgBotNoClient:           "Клиент по вашему запросу не найден.",
		MsgBotClientInfo:         "👤 Клиент: %s\n📞 Тел: %s\n🏠 Адрес: %s\n💰 Общий долг: %s",
		MsgBotNotifySale:         "🔔 НОВАЯ ПРОДАЖА!\n🏢 Бизнес: %s\n💰 Сумма: %s\n📝 Товаров: %d",
		MsgBotNotifyRefund:       "🔔 ВОЗВРАТ!\n🏢 Бизнес: %s\n💰 Сумма: %s",
		MsgBotNotifyExpense:      "🔔 РАСХОД!\n🏢 Бизнес: %s\n💰 Сумма: %s\n📝 Категория: %s",
		MsgBotBtnSendRequest:     "✉️ Отправить запрос",
		MsgBotEnterRequest:       "✏️ Пожалуйста, напишите ваш запрос или вопрос:",
		MsgBotRequestSent:        "✅ Ваш запрос отправлен в магазин. Мы скоро ответим.",
		MsgBotNewRequest:         "📩 Новый запрос от клиента:\n\n%s",
		MsgBotBtnReply:           "✍️ Ответить",
		MsgBotEnterReply:         "✏️ Пожалуйста, напишите ваш ответ:",
		MsgBotReplySent:          "✅ Ваш ответ отправлен.",
		MsgBotReplyFromStaff:     "📝 Ответ из магазина:\n\n%s",
		MsgBotMenuProductsSearch: "🔍 Поиск продуктов",
		MsgBotMenuRecentSales:    "📄 Последние продажи",
		MsgBotEnterProductSearch: "📦 Введите название или код товара:",
		MsgClientPhoneIsUser:     "❌ Этот номер телефона принадлежит сотруднику и не может быть добавлен как клиент",
		MsgBotNoProduct:          "Товар не найден.",
		MsgBotProductInfo:        "📦 Товар: %s\n💰 Цена: %s\n🛍 Кол-во: %d",
		MsgBotRecentSalesHeader:  "📄 Последние %d продаж:\n",
		MsgBotRecentSalesItem:    "\n- %s: %s (id:%d)",
		MsgBotMenuExpense:        "💸 Добавить расход",
		MsgBotEnterExpenseAmount: "💸 Введите сумму:",
		MsgBotEnterExpenseDesc:   "📝 Введите описание:",
		MsgBotExpenseSuccess:     "Расход успешно сохранен!",
		MsgBotDailyStatHeader:    "Ежедневный отчет за %s:",
		MsgBotSelectBusinessBroadcast: "Клиентам какого бизнеса вы хотите отправить сообщение?",
		MsgBotSelectBusinessExpense:   "Для какого бизнеса вы хотите добавить расход?",
		MsgBotAllBusinesses:           "Все бизнесы",
		MsgBotMenuBroadcast:      "📢 Рассылка",
		MsgBotEnterBroadcastImg:  "🖼️ Отправьте изображение или видео для рассылки:",
		MsgBotEnterBroadcastDesc: "📝 Введите текст описания:",
		MsgBotBroadcastConfirm:   "⚠️ Вы уверены, что хотите отправить это %d клиентам?",
		MsgBotBroadcastSuccess:   "✅ Рассылка отправлена %d клиентам!",
		MsgBotBtnSendAll:         "🚀 Отправить сейчас",
		MsgBotBtnCancel:          "❌ Отмена",
		MsgBotRefundsDetailHeader: "🔄 Детали возвратов (Сегодня):\n",
	},
}

func FormatMoney(v float64, lang string) string {
	absV := v
	if v < 0 {
		absV = -v
	}
	s := fmt.Sprintf("%.2f", absV)
	parts := strings.Split(s, ".")
	intPart := parts[0]

	var res []string
	for i := len(intPart); i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		res = append([]string{intPart[start:i]}, res...)
	}
	formatted := strings.Join(res, " ")

	if len(parts) > 1 && parts[1] != "00" {
		formatted += "." + parts[1]
	}

	if v < 0 {
		formatted = "-" + formatted
	}

	switch lang {
	case LangRu:
		return formatted + " сум"
	case LangUzCyrl:
		return formatted + " сўм"
	case LangEn:
		return formatted + " USD"
	default:
		return formatted + " so'm"
	}
}

// T translates a message key to the given language
func T(lang, key string) string {
	if msgs, ok := translations[lang]; ok {
		if msg, ok := msgs[key]; ok {
			return msg
		}
	}
	// Fallback to default language
	if msgs, ok := translations[defaultLang]; ok {
		if msg, ok := msgs[key]; ok {
			return msg
		}
	}
	// Fallback to English
	if msgs, ok := translations[LangEn]; ok {
		if msg, ok := msgs[key]; ok {
			return msg
		}
	}
	return key
}

// GetLang extracts language from gin context (set by middleware)
func GetLang(c *gin.Context) string {
	if lang, exists := c.Get("lang"); exists {
		return lang.(string)
	}
	return defaultLang
}

// Tc is a convenience function: translates using gin context's language
func Tc(c *gin.Context, key string) string {
	return T(GetLang(c), key)
}

// ParseAcceptLanguage extracts the preferred language from Accept-Language header
func ParseAcceptLanguage(header string) string {
	if header == "" {
		return defaultLang
	}

	// Parse languages with quality values, e.g. "uz, ru;q=0.9, en;q=0.8"
	parts := strings.Split(header, ",")
	for _, part := range parts {
		lang := strings.TrimSpace(strings.SplitN(part, ";", 2)[0])
		lang = strings.ToLower(lang)

		switch {
		case lang == "uz-cyrl" || lang == "uz_cyrl":
			return LangUzCyrl
		case strings.HasPrefix(lang, "uz"):
			return LangUz
		case strings.HasPrefix(lang, "ru"):
			return LangRu
		case strings.HasPrefix(lang, "en"):
			return LangEn
		}
	}

	return defaultLang
}
