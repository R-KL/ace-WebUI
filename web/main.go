package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type Settings struct {
	Theme    string `json:"theme"`
	FontSize int    `json:"fontSize"`
}

const settingsFile = "settings.json"
const filesDir = "files" // Directory to store user files

// --- Settings Handlers ---

func loadSettings() (Settings, error) {
	var s Settings
	data, err := os.ReadFile(settingsFile)
	if err != nil {
		if os.IsNotExist(err) {
			return Settings{Theme: "ace/theme/monokai", FontSize: 16}, nil
		}
		return s, err
	}
	err = json.Unmarshal(data, &s)
	return s, err
}

func saveSettings(s Settings) error {
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(settingsFile, data, 0644)
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodGet:
		settings, err := loadSettings()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(settings)
	case http.MethodPost:
		var s Settings
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := saveSettings(s); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Fprint(w, `{"status":"ok"}`)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// --- File I/O Handlers ---

func fileHandler(w http.ResponseWriter, r *http.Request) {
	fileName := r.URL.Query().Get("name")
	if fileName == "" {
		http.Error(w, "File name is required", http.StatusBadRequest)
		return
	}

	safeFileName := filepath.Join(filesDir, filepath.Base(fileName))
	if !strings.HasPrefix(safeFileName, filesDir+string(os.PathSeparator)) {
		http.Error(w, "Invalid file path", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		data, err := os.ReadFile(safeFileName)
		if err != nil {
			if os.IsNotExist(err) {
				http.Error(w, "File not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/plain")
		w.Write(data)
	case http.MethodPost:
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			return
		}
		if err := os.WriteFile(safeFileName, body, 0644); err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}
		fmt.Fprint(w, `{"status":"file saved"}`)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	if err := os.MkdirAll(filesDir, 0755); err != nil {
		log.Fatalf("Could not create files directory: %v", err)
	}

	// Create a new router for our API endpoints
	mux := http.NewServeMux()

	// Since Caddy is handling the /editor/ prefix, our Go app can respond to the simpler paths.
	// Caddy will strip the prefix before forwarding.
	// However, it's often better to handle the full path in Go to be explicit.
	mux.HandleFunc("/editor/settings", settingsHandler)
	mux.HandleFunc("/editor/file", fileHandler)

	// A simple health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "API server is healthy")
	})

	// All static file serving logic has been removed.

	port := "8082"
	fmt.Printf("Starting API server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}
