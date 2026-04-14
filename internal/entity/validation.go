package entity

// import "regexp"

// // ---------- Regex patternlar ----------

// // userName: harf bilan boshlanadi, harflar, raqamlar va _ dan iborat, 3-20 ta belgi
// var usernameRegex = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]{2,19}$`)

// // phoneNumber: +998 bilan boshlanib, 9 ta raqam davom etadi (O'zbekiston formati)
// var phoneRegex = regexp.MustCompile(`^\+998\d{9}$`)

// // password kuchlilik tekshirish uchun regexlar
// var (
// 	passwordUpperRegex   = regexp.MustCompile(`[A-Z]`)         // kamida 1 katta harf
// 	passwordLowerRegex   = regexp.MustCompile(`[a-z]`)         // kamida 1 kichik harf
// 	passwordDigitRegex   = regexp.MustCompile(`\d`)            // kamida 1 raqam
// 	passwordSpecialRegex = regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`) // kamida 1 maxsus belgi
// )

// // ---------- Validatsiya funksiyalari ----------

// // ValidateUsername — userName formatini tekshiradi
// // Qoidalar: harf bilan boshlanadi, 3-20 belgi, faqat harf/raqam/_ ruxsat
// func ValidateUsername(username string) error {
// 	if !usernameRegex.MatchString(username) {
// 		return fmt.Errorf("username noto'g'ri formatda: harf bilan boshlanishi, 3-20 ta belgi, faqat harf, raqam va _ bo'lishi kerak")
// 	}
// 	return nil
// }

// // ValidatePhoneNumber — telefon raqam formatini tekshiradi
// // Format: +998XXXXXXXXX (O'zbekiston)
// func ValidatePhoneNumber(phone string) error {
// 	if phone == "" {
// 		return nil // ixtiyoriy maydon
// 	}
// 	if !phoneRegex.MatchString(phone) {
// 		return fmt.Errorf("telefon raqam noto'g'ri formatda: +998XXXXXXXXX ko'rinishida bo'lishi kerak")
// 	}
// 	return nil
// }

// // ValidatePassword — parol kuchliligini tekshiradi
// // Qoidalar: kamida 8 belgi, katta harf, kichik harf, raqam va maxsus belgi
// func ValidatePassword(password string) error {
// 	if len(password) < 8 {
// 		return fmt.Errorf("parol kamida 8 ta belgidan iborat bo'lishi kerak")
// 	}
// 	if !passwordUpperRegex.MatchString(password) {
// 		return fmt.Errorf("parolda kamida 1 ta katta harf bo'lishi kerak")
// 	}
// 	if !passwordLowerRegex.MatchString(password) {
// 		return fmt.Errorf("parolda kamida 1 ta kichik harf bo'lishi kerak")
// 	}
// 	if !passwordDigitRegex.MatchString(password) {
// 		return fmt.Errorf("parolda kamida 1 ta raqam bo'lishi kerak")
// 	}
// 	if !passwordSpecialRegex.MatchString(password) {
// 		return fmt.Errorf("parolda kamida 1 ta maxsus belgi bo'lishi kerak (!@#$%^&* va h.k.)")
// 	}
// 	return nil
// }

// // ---------- Ishlatish namunasi (Register va Update uchun) ----------

// // Register da:
// // func (uc *UserUseCase) Register(req entity.RegisterRequest) (*entity.User, error) {
// //     if err := entity.ValidateUsername(req.UserName); err != nil {
// //         return nil, err
// //     }
// //     if err := entity.ValidatePhoneNumber(req.PhoneNumber); err != nil {
// //         return nil, err
// //     }
// //     if err := entity.ValidatePassword(req.Password); err != nil {
// //         return nil, err
// //     }
// //     ... qolgan logika
// // }

// // Update da:
// // func (uc *UserUseCase) Update(id int, req entity.UpdateUserRequest) error {
// //     if req.PhoneNumber != nil {
// //         if err := entity.ValidatePhoneNumber(*req.PhoneNumber); err != nil {
// //             return err
// //         }
// //     }
// //     if req.Password != nil {
// //         if err := entity.ValidatePassword(*req.Password); err != nil {
// //             return err
// //         }
// //     }
// //     ... qolgan logika
// // }
