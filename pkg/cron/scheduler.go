package cron

import (
	"log"

	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	cron *cron.Cron
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		cron: cron.New(),
	}
}

func (s *Scheduler) AddJob(spec string, job func()) error {
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
