package notifier

import (
	"fmt"
	"log"
	"net/http"
	"savdosklad/internal/repository"
	"savdosklad/pkg/i18n"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type TelegramNotifier struct {
	api      *tgbotapi.BotAPI
	userRepo repository.UserRepository
	bizRepo  repository.BusinessRepository
}

func NewTelegramNotifier(token string, userRepo repository.UserRepository, bizRepo repository.BusinessRepository) (*TelegramNotifier, error) {
	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}
	api, err := tgbotapi.NewBotAPIWithClient(token, tgbotapi.APIEndpoint, httpClient)
	if err != nil {
		return nil, err
	}
	return &TelegramNotifier{api: api, userRepo: userRepo, bizRepo: bizRepo}, nil
}

func (n *TelegramNotifier) NotifySale(bizID int, total float64, itemsCount int) {
	if n == nil || n.api == nil {
		return
	}
	biz, err := n.bizRepo.GetByID(bizID)
	if err != nil {
		log.Printf("NotifySale: bizRepo.GetByID error: %v\n", err)
		return
	}

	user, err := n.userRepo.GetByID(biz.UserID)
	if err != nil {
		log.Printf("NotifySale: userRepo.GetByID error: %v\n", err)
		return
	}
	if user.TelegramUserID == 0 {
		return
	}

	lang := user.Language
	if lang == "" {
		lang = "uz"
	}

	bizName := ""
	if biz.Name != nil {
		bizName = *biz.Name
	}

	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotNotifySale), bizName, i18n.FormatMoney(total, lang), itemsCount)
	n.send(user.TelegramUserID, text)
}

func (n *TelegramNotifier) NotifyRefund(bizID int, total float64) {
	if n == nil || n.api == nil {
		return
	}
	biz, _ := n.bizRepo.GetByID(bizID)
	user, _ := n.userRepo.GetByID(biz.UserID)
	if user == nil || user.TelegramUserID == 0 {
		return
	}

	lang := user.Language
	if lang == "" {
		lang = "uz"
	}
	bizName := ""
	if biz.Name != nil {
		bizName = *biz.Name
	}
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotNotifyRefund), bizName, i18n.FormatMoney(total, lang))
	n.send(user.TelegramUserID, text)
}

func (n *TelegramNotifier) NotifyExpense(bizID int, total float64, category string) {
	if n == nil || n.api == nil {
		return
	}
	biz, _ := n.bizRepo.GetByID(bizID)
	user, _ := n.userRepo.GetByID(biz.UserID)
	if user == nil || user.TelegramUserID == 0 {
		return
	}

	lang := user.Language
	if lang == "" {
		lang = "uz"
	}
	bizName := ""
	if biz.Name != nil {
		bizName = *biz.Name
	}
	text := fmt.Sprintf(i18n.T(lang, i18n.MsgBotNotifyExpense), bizName, i18n.FormatMoney(total, lang), category)
	n.send(user.TelegramUserID, text)
}

func (n *TelegramNotifier) SendReceipt(tgID int64, text string, pdfBytes []byte, imageBytes []byte, pdfName, imgName string) {
	if n == nil || n.api == nil {
		log.Printf("SendReceipt skipped: bot not initialized")
		return
	}
	
	msg := tgbotapi.NewMessage(tgID, text)
	if _, err := n.api.Send(msg); err != nil {
		log.Printf("SendReceipt: error sending text to %d: %v\n", tgID, err)
	}

	if len(pdfBytes) > 0 {
		pdfFile := tgbotapi.FileBytes{Name: pdfName, Bytes: pdfBytes}
		doc := tgbotapi.NewDocument(tgID, pdfFile)
		if _, err := n.api.Send(doc); err != nil {
			log.Printf("SendReceipt: error sending PDF to %d: %v\n", tgID, err)
		}
	}

	if len(imageBytes) > 0 {
		imgFile := tgbotapi.FileBytes{Name: imgName, Bytes: imageBytes}
		photo := tgbotapi.NewPhoto(tgID, imgFile)
		if _, err := n.api.Send(photo); err != nil {
			log.Printf("SendReceipt: error sending image to %d: %v\n", tgID, err)
		}
	}
}

func (n *TelegramNotifier) send(tgID int64, text string) {
	if n == nil || n.api == nil {
		return
	}
	msg := tgbotapi.NewMessage(tgID, text)
	if _, err := n.api.Send(msg); err != nil {
		log.Printf("Notifier error sending to %d: %v", tgID, err)
	}
}
