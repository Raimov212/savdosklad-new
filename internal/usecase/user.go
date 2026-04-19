package usecase

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"savdosklad/internal/entity"
	"savdosklad/internal/repository"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/i18n"

	"golang.org/x/crypto/bcrypt"
)

type UserUseCase struct {
	repo       repository.UserRepository
	jwtManager *auth.JWTManager
}

func NewUserUseCase(repo repository.UserRepository, jwtManager *auth.JWTManager) *UserUseCase {
	return &UserUseCase{repo: repo, jwtManager: jwtManager}
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
