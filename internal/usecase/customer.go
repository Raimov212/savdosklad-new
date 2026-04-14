package usecase

import (
	"errors"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"savdosklad/internal/entity"
	"savdosklad/internal/repository/postgres"
	"savdosklad/pkg/auth"
	"savdosklad/pkg/i18n"
)

type CustomerUseCase struct {
	repo       *postgres.CustomerRepo
	jwtManager *auth.JWTManager
}

func NewCustomerUseCase(repo *postgres.CustomerRepo, jwtManager *auth.JWTManager) *CustomerUseCase {
	return &CustomerUseCase{repo: repo, jwtManager: jwtManager}
}

func (uc *CustomerUseCase) Register(c *gin.Context, req *entity.RegisterCustomerRequest) (*entity.Customer, error) {
	// Check if phone already exists
	existing, _ := uc.repo.GetByPhone(req.PhoneNumber)
	if existing != nil {
		return nil, errors.New(i18n.Tc(c, i18n.MsgPhoneAlreadyRegistered))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var email *string
	if req.Email != "" {
		email = &req.Email
	}

	customer := &entity.Customer{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		PhoneNumber: req.PhoneNumber,
		Email:       email,
		Password:    string(hashedPassword),
		Image:       req.Image,
	}

	if err := uc.repo.Create(customer); err != nil {
		return nil, err
	}

	return customer, nil
}

func (uc *CustomerUseCase) Login(req *entity.LoginCustomerRequest) (*entity.LoginCustomerResponse, error) {
	customer, err := uc.repo.GetByPhone(req.PhoneNumber)
	if err != nil {
		return nil, errors.New("invalid phone number or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(customer.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid phone number or password")
	}

	// Role -1 indicates customer (to distinguish from business users)
	token, err := uc.jwtManager.GenerateToken(customer.ID, customer.PhoneNumber, -1)
	if err != nil {
		return nil, err
	}

	return &entity.LoginCustomerResponse{
		Token:    token,
		Customer: *customer,
	}, nil
}

func (uc *CustomerUseCase) GetByID(id int) (*entity.Customer, error) {
	return uc.repo.GetByID(id)
}

func (uc *CustomerUseCase) Update(id int, req *entity.UpdateCustomerRequest) error {
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
