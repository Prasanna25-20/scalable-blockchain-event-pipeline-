package main

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"

	"github.com/segmentio/kafka-go"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Metrics
var (
	eventsProcessed = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "events_processed_total",
			Help: "Total number of processed events",
		},
	)

	processingErrors = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "processing_errors_total",
			Help: "Total number of processing errors",
		},
	)
)

//  Logger
func initLogger() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.InfoLevel)
}

//  Metrics
func initMetrics() {
	prometheus.MustRegister(eventsProcessed, processingErrors)
}

func main() {

	initLogger()
	initMetrics()

	log.Info(" Processor starting...")

	// METRICS SERVER
	go func() {
		http.Handle("/metrics", promhttp.Handler())
		log.Info(" Metrics at :2112/metrics")
		if err := http.ListenAndServe(":2112", nil); err != nil {
			log.WithError(err).Fatal(" Metrics server failed")
		}
	}()

	//  CONNECT DB WITH RETRY
	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("postgres",
			"postgres://myuser:mypass@postgres:5432/mydb?sslmode=disable")

		if err == nil {
			err = db.Ping()
			if err == nil {
				break
			}
		}

		log.Warn(" Waiting for DB...")
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.WithError(err).Fatal("DB not reachable")
	}

	defer db.Close()
	log.Info(" Connected to Postgres")

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS events (
			id SERIAL PRIMARY KEY,
			data TEXT
		)
	`)
	if err != nil {
		log.WithError(err).Fatal(" Failed to create table")
	}

	//  CONNECT KAFKA WITH RETRY
	var reader *kafka.Reader

	for i := 0; i < 10; i++ {
		reader = kafka.NewReader(kafka.ReaderConfig{
			Brokers:     []string{"kafka:9092"},
			Topic:       "events",
			GroupID:     "processor-group-V2",
			StartOffset: kafka.FirstOffset,
			MinBytes:    10e3,
			MaxBytes:    10e6,
		})

		conn, err := kafka.Dial("tcp", "kafka:9092")
		if err == nil {
			conn.Close()
			break
		}

		log.Warn(" Waiting for Kafka...")
		time.Sleep(2 * time.Second)
	}

	log.Info(" Connected to Kafka")

	//  PROCESS LOOP
	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.WithError(err).Error(" Kafka read error")
			processingErrors.Inc()
			continue
		}

		start := time.Now()
		txHash := string(msg.Value)

		log.Infof("Received message: %s", txHash)

		_, err = db.Exec("INSERT INTO events(data) VALUES($1)", txHash)
		if err != nil {
			log.WithError(err).Error(" DB insert failed")
			processingErrors.Inc()
			continue
		}

		log.WithFields(log.Fields{
			"txHash":  txHash,
			"offset":  msg.Offset,
			"latency": time.Since(start).String(),
		}).Info(" Event processed")

		eventsProcessed.Inc()
	}
}
