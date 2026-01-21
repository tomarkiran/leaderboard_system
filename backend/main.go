package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"os"
)

type User struct {
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	Rank     int    `json:"rank"`
}

var (
	users   []User
	userMap = make(map[string]*User)
	mu      sync.RWMutex
)

func main() {
	seedUsers()

	http.HandleFunc("/leaderboard", getLeaderboard)
	http.HandleFunc("/search", searchUser)
	http.HandleFunc("/update", randomUpdate)

	log.Println("Backend running on :8080")
	port := os.Getenv("PORT")
if port == "" {
	port = "8080"
}

log.Println("Server running on port", port)
log.Fatal(http.ListenAndServe(":"+port, nil))
}

//  --DATA INITIALIZATION--

func seedUsers() {
	rand.Seed(time.Now().UnixNano())
	mu.Lock()
	defer mu.Unlock()

	for i := 1; i <= 10000; i++ {
		u := User{
			Username: "user_" + strconv.Itoa(i),
			Rating:   rand.Intn(4901) + 100,
		}
		users = append(users, u)
		userMap[u.Username] = &users[len(users)-1]
	}
	updateRanks()
}

// -- CORE RANKING LOGIC --

func updateRanks() {
	sort.Slice(users, func(i, j int) bool {
		return users[i].Rating > users[j].Rating
	})

	rank := 1
	for i := range users {
		if i > 0 && users[i].Rating < users[i-1].Rating {
			rank = i + 1
		}
		users[i].Rank = rank
	}
}

// -- API HANDLERS --

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
}

func getLeaderboard(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	mu.RLock()
	defer mu.RUnlock()

	json.NewEncoder(w).Encode(users[:100])
}

func searchUser(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	query := strings.ToLower(r.URL.Query().Get("username"))

	mu.RLock()
	defer mu.RUnlock()

	var results []User
	for _, u := range users {
		if strings.Contains(strings.ToLower(u.Username), query) {
			results = append(results, u)
		}
	}

	json.NewEncoder(w).Encode(results)
}

func randomUpdate(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	mu.Lock()
	defer mu.Unlock()

	for i := 0; i < 200; i++ {
		idx := rand.Intn(len(users))
		users[idx].Rating = rand.Intn(4901) + 100
	}
	updateRanks()

	w.Write([]byte(`{"status":"ratings updated"}`))
}
