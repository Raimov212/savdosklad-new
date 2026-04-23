package usecase

import (
	"crypto/rand"
	"errors"
	"fmt"
	"strings"
	"time"

	"savdosklad/internal/entity"
	"savdosklad/internal/notifier"
	"savdosklad/internal/repository"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/cache"
	"savdosklad/pkg/i18n"

	"golang.org/x/crypto/bcrypt"
)

type UserUseCase struct {
	repo       repository.UserRepository
	jwtManager *auth.JWTManager
	tgNotifier *notifier.TelegramNotifier
}

func NewUserUseCase(repo repository.UserRepository, jwtManager *auth.JWTManager, tgNotifier *notifier.TelegramNotifier) *UserUseCase {
	return &UserUseCase{repo: repo, jwtManager: jwtManager, tgNotifier: tgNotifier}
}

func (uc *UserUseCase) CreateEmployee(req entity.RegisterRequest, adminID int) (*entity.User, error) {
	existing, _ := uc.repo.GetByUsername(req.UserName)
	if existing != nil {
		return nil, errors.New(i18n.MsgUsernameAlreadyExists)
	}

	// Fetch admin to get brand info
	admin, _ := uc.repo.GetByID(adminID)
	if admin != nil {
		if admin.BrandName != nil && *admin.BrandName != "" {
			req.BrandName = *admin.BrandName
		}
		if admin.BrandImage != nil && *admin.BrandImage != "" {
			req.BrandImage = *admin.BrandImage
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	selfOfferCode := strings.ToUpper(strings.TrimSpace(req.UserName))

	user := &entity.User{
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		PhoneNumber:    &req.PhoneNumber,
		UserName:       req.UserName,
		Password:       string(hashedPassword),
		Role:           req.Role, // Use role from request
		CreatedBy:      &adminID,
		IsVerified:     true, 
		IsExpired:      false,
		Image:          &req.Image,
		BrandName:      &req.BrandName,
		BrandImage:     &req.BrandImage,
		MarketID:       req.MarketID,
		OfferCode:      &selfOfferCode,
		ExpirationDate: time.Now().AddDate(100, 0, 0),
		BusinessIDs:    req.BusinessIDs,
		BusinessPermissions: req.BusinessPermissions,
	}
	if req.ExpirationDate != nil {
		user.ExpirationDate = *req.ExpirationDate
	}

	id, err := uc.repo.Create(user)
	if err != nil {
		return nil, err
	}

	user.ID = id
	return user, nil
}

func (uc *UserUseCase) Register(req entity.RegisterRequest) (*entity.User, error) {
	existing, _ := uc.repo.GetByUsername(req.UserName)
	if existing != nil {
		return nil, errors.New(i18n.MsgUsernameAlreadyExists)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	if req.MarketID != nil && *req.MarketID == 0 {
		req.MarketID = nil
	}

	// 1. Yangi foydalanuvchining o'z kodi (username katta harflarda)
	selfOfferCode := strings.ToUpper(strings.TrimSpace(req.UserName))
	
	// 2. Uni taklif qilgan odamning kodi (agar ro'yxatdan o'tishda kiritgan bo'lsa)
	var hisInviterCode *string
	if strings.TrimSpace(req.OfferCode) != "" {
		code := strings.TrimSpace(req.OfferCode)
		hisInviterCode = &code
	}

	user := &entity.User{
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		PhoneNumber:    &req.PhoneNumber,
		UserName:       req.UserName,
		Password:       string(hashedPassword),
		Role:           entity.RoleAdmin, // Ro'yxatdan o'tgan foydalanuvchi = Biznes egasi (Admin)
		IsVerified:     false,
		IsExpired:      false,
		Image:          &req.Image,
		BrandName:      &req.BrandName,
		BrandImage:     &req.BrandImage,
		MarketID:       req.MarketID,
		OfferCode:      &selfOfferCode,   // O'zining kodi
		InviterCode:    hisInviterCode,   // Taklif qilgan odamning kodi
		ExpirationDate: time.Now().AddDate(0, 1, 0),
	}

	id, err := uc.repo.Create(user)
	if err != nil {
		return nil, err
	}

	user.ID = id
	return user, nil
}

func (uc *UserUseCase) Login(req entity.LoginRequest) (*entity.LoginResponse, error) {
	user, err := uc.repo.GetByUsername(req.UserName)
	if err != nil {
		return nil, errors.New(i18n.MsgInvalidCredentials)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New(i18n.MsgInvalidCredentials)
	}

	token, err := uc.jwtManager.GenerateToken(user.ID, user.UserName, user.Role)
	if err != nil {
		return nil, err
	}

	return &entity.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (uc *UserUseCase) GetAll() ([]entity.User, error) {
	return uc.repo.GetAll()
}

func (uc *UserUseCase) GetByTelegramID(tgID int64) (*entity.User, error) {
	return uc.repo.GetByTelegramID(tgID)
}

func (uc *UserUseCase) LinkTelegram(phone string, tgID int64) error {
	// 1. Faqat raqamlarni qoldirish
	cleanDigits := ""
	for _, r := range phone {
		if r >= '0' && r <= '9' {
			cleanDigits += string(r)
		}
	}

	// Turli variantlarni tekshirish
	variants := []string{
		"+" + cleanDigits, // +998...
		cleanDigits,       // 998...
	}

	for _, v := range variants {
		user, err := uc.repo.GetByPhoneNumber(v)
		if err == nil {
			return uc.repo.UpdateTelegramID(user.ID, tgID)
		}
	}

	// Agarda hali ham topilmasa, bazadagi barcha foydalanuvchilarni ko'rib chiqish (fallback)
	users, err := uc.repo.GetAll()
	if err == nil {
		for _, u := range users {
			if u.PhoneNumber != nil {
				uDigits := ""
				for _, r := range *u.PhoneNumber {
					if r >= '0' && r <= '9' {
						uDigits += string(r)
					}
				}
				if uDigits == cleanDigits {
					return uc.repo.UpdateTelegramID(u.ID, tgID)
				}
			}
		}
	}

	return fmt.Errorf("user not found with phone: %s", phone)
}

func (uc *UserUseCase) UpdateLanguage(userID int, lang string) error {
	return uc.repo.UpdateLanguage(userID, lang)
}

func (uc *UserUseCase) GetByID(id int) (*entity.User, error) {
	return uc.repo.GetByID(id)
}

func (uc *UserUseCase) Update(id int, req entity.UpdateUserRequest) error {
	// If it's an employee, ensure brand info is synced from admin if missing
	if target, err := uc.repo.GetByID(id); err == nil && target != nil && target.Role == entity.RoleEmployee && target.CreatedBy != nil {
		if admin, err := uc.repo.GetByID(*target.CreatedBy); err == nil && admin != nil {
			if (req.BrandName == nil || *req.BrandName == "") && admin.BrandName != nil {
				req.BrandName = admin.BrandName
			}
			if (req.BrandImage == nil || *req.BrandImage == "") && admin.BrandImage != nil {
				req.BrandImage = admin.BrandImage
			}
		}
	}

	if req.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		hashed := string(hashedPassword)
		req.Password = &hashed
	}
	return uc.repo.Update(id, req)
}

func (uc *UserUseCase) Delete(id int) error {
	return uc.repo.Delete(id)
}

func (uc *UserUseCase) GetEmployees(adminID int) ([]entity.User, error) {
	return uc.repo.GetByCreatedBy(adminID)
}

func (uc *UserUseCase) ExtendSubscription(req entity.ExtendSubscriptionRequest) error {
	user, err := uc.repo.GetByUsername(req.UserName)
	if err != nil {
		return errors.New("Foydalanuvchi topilmadi")
	}

	formats := []string{
		"2006-01-02 15:04:05-07",
		"2006-01-02 15:04:05+07",
		"2006-01-02 15:04:05",
		time.RFC3339,
		"2006-01-02",
	}

	var expirationTime time.Time
	var parseErr error
	for _, format := range formats {
		expirationTime, parseErr = time.Parse(format, req.ExpirationDate)
		if parseErr == nil {
			break
		}
	}

	if parseErr != nil {
		// Try parsing with space and time zone like in the error: 2026-04-28 00:00:00+00
		expirationTime, parseErr = time.Parse("2006-01-02 15:04:05-0700", strings.ReplaceAll(req.ExpirationDate, "+00", "+0000"))
		if parseErr != nil {
			return errors.New("Sana formati noto'g'ri. Namuna: 2026-04-28 00:00:00")
		}
	}

	isExpired := false
	updateReq := entity.UpdateUserRequest{
		ExpirationDate: &expirationTime,
		IsExpired:      &isExpired,
	}

	return uc.repo.Update(user.ID, updateReq)
}

// LinkTelegramByID directly links a telegram ID to a user by userID (no phone needed).
// Used by the token-based Telegram linking flow.
func (uc *UserUseCase) LinkTelegramByID(userID int, tgID int64) error {
	return uc.repo.UpdateTelegramID(userID, tgID)
}
func (uc *UserUseCase) HasPermission(userID, businessID int, action string) (bool, error) {
	return uc.repo.HasPermission(userID, businessID, action)
}

func (uc *UserUseCase) ForgotPassword(req entity.ForgotPasswordRequest) error {
	user, err := uc.repo.GetByUsername(req.UserName)
	if err != nil {
		// Do not reveal if user exists or not for security, but we need to for UX here.
		return errors.New(i18n.MsgUserNotFound)
	}

	if user.TelegramUserID == 0 {
		return errors.New("Sizda Telegram bot ulanmagan. Parolni tiklash imkonsiz. Iltimos, admin bilan bog'laning.")
	}

	// Generate 6 digit code
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return errors.New("Kodni generatsiya qilishda xatolik")
	}
	code := fmt.Sprintf("%06d", int(bytes[0])<<16|int(bytes[1])<<8|int(bytes[2]))[:6]

	// Save to cache with expiration
	cache.PasswordResetCache.Store(req.UserName, code)

	// In a real app, we should use a TTL cache, but since we are using sync.Map, we can spawn a goroutine to clean it up
	go func(username string) {
		time.Sleep(5 * time.Minute)
		cache.PasswordResetCache.Delete(username)
	}(req.UserName)

	lang := user.Language
	if lang == "" {
		lang = "uz"
	}

	text := fmt.Sprintf("🔑 Parolni tiklash kodi: %s\n\nBu kod 5 daqiqa davomida amal qiladi. Agar siz so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.", code)
	if lang == "ru" {
		text = fmt.Sprintf("🔑 Код для сброса пароля: %s\n\nЭтот код действителен в течение 5 минут. Если вы не запрашивали, проигнорируйте это сообщение.", code)
	} else if lang == "en" {
		text = fmt.Sprintf("🔑 Password reset code: %s\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this message.", code)
	} else if lang == "uz-cyrl" {
		text = fmt.Sprintf("🔑 Паролни тиклаш коди: %s\n\nБу код 5 дақиқа давомида амал қилади. Агар сиз сўрамаган бўлсангиз, бу хабарни эътиборсиз қолдиринг.", code)
	}

	if uc.tgNotifier != nil {
		uc.tgNotifier.SendRawMessage(user.TelegramUserID, text)
	} else {
		return errors.New("Telegram xizmati ishlamayapti")
	}

	return nil
}

func (uc *UserUseCase) ResetPassword(req entity.ResetPasswordRequest) error {
	val, ok := cache.PasswordResetCache.Load(req.UserName)
	if !ok {
		return errors.New("Kod yaroqsiz yoki muddati o'tgan")
	}
	
	if val.(string) != req.Code {
		return errors.New("Noto'g'ri kod kiritildi")
	}

	user, err := uc.repo.GetByUsername(req.UserName)
	if err != nil {
		return errors.New(i18n.MsgUserNotFound)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("Parolni yangilashda xatolik")
	}

	hashed := string(hashedPassword)
	updateReq := entity.UpdateUserRequest{
		Password: &hashed,
	}

	err = uc.repo.Update(user.ID, updateReq)
	if err != nil {
		return err
	}

	// Delete from cache
	cache.PasswordResetCache.Delete(req.UserName)
	return nil
}
