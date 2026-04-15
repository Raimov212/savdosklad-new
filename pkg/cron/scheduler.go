package cron

import (
	"log"

	"github.com/robfig/cron/v3"
)

// Scheduler (Vaqtli ishlovchi): Ma'lum vaqt oralig'ida ishlashi kerak bo'lgan
// vazifalarni boshqarish uchun foydalaniladi. Ichida Parallelizm (Goroutines) ishlatadi.
type Scheduler struct {
	cron *cron.Cron
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		cron: cron.New(),
	}
}

func (s *Scheduler) AddJob(spec string, job func()) error {
	// AddFunc yangi vazifani (job) reja asosida ro'yxatga oladi.
	// Ishga tushganda har bir job alohida goroutineda bajariladi.
	_, err := s.cron.AddFunc(spec, job)
	if err != nil {
		return err
	}
	log.Printf("Cron job scheduled: %s", spec)
	return nil
}

func (s *Scheduler) Start() {
	s.cron.Start()
	log.Println("Cron scheduler started")
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
	log.Println("Cron scheduler stopped")
}
