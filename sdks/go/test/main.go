package main

import (
	"fmt"

	unosend "github.com/unosend/unosend-go"
)

func main() {
	client := unosend.New("un_0888c5a65f252209925082f16488835e",
		unosend.WithBaseURL("http://localhost:3000/api/v1"))

	fmt.Println("Testing Go SDK...")
	fmt.Println("")

	// Test emails list
	fmt.Println("1. Testing emails.List()...")
	emails, err := client.Emails.List(nil)
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Success! Found %d emails\n", len(emails))
	}

	// Test domains list
	fmt.Println("")
	fmt.Println("2. Testing domains.List()...")
	domains, err := client.Domains.List()
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Success! Found %d domains\n", len(domains))
	}

	// Test audiences list
	fmt.Println("")
	fmt.Println("3. Testing audiences.List()...")
	audiences, err := client.Audiences.List()
	if err != nil {
		fmt.Printf("   Error: %v\n", err)
	} else {
		fmt.Printf("   Success! Found %d audiences\n", len(audiences))
	}

	fmt.Println("")
	fmt.Println("✅ Go SDK is working!")
}
