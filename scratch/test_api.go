package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	// Login qilib tokenni olish (o'zimizga kerakmas, prosta public roleni tekshirish yoki xatoni ko'rish uchun)
	// Aslida admin tokenni olish kerak, lekin xato bo'lsa server logidayoq 500 beradi
	req, _ := http.NewRequest("GET", "http://localhost:8080/api/v1/admin/users", nil)
	// Agar token yo'qligi uchun 401 bersa ham bu server ishlaganini bildiradi.
	// Agar 500 bersa kod xato
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Serverga ulanishda xato:", err)
		return
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Javob: %s\n", string(body))
}
