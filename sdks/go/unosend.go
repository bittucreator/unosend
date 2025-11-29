// Package unosend provides a Go client for the Unosend Email API.
package unosend

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	defaultBaseURL = "https://api.unosend.com/v1"
	userAgent      = "unosend-go/1.0.0"
)

// Client is the Unosend API client.
type Client struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client

	Emails    *EmailsService
	Domains   *DomainsService
	Audiences *AudiencesService
	Contacts  *ContactsService
}

// ClientOption is a function that configures the client.
type ClientOption func(*Client)

// WithBaseURL sets a custom base URL for the API.
func WithBaseURL(url string) ClientOption {
	return func(c *Client) {
		c.baseURL = url
	}
}

// WithHTTPClient sets a custom HTTP client.
func WithHTTPClient(client *http.Client) ClientOption {
	return func(c *Client) {
		c.httpClient = client
	}
}

// New creates a new Unosend client.
func New(apiKey string, opts ...ClientOption) *Client {
	c := &Client{
		apiKey:  apiKey,
		baseURL: defaultBaseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}

	for _, opt := range opts {
		opt(c)
	}

	c.Emails = &EmailsService{client: c}
	c.Domains = &DomainsService{client: c}
	c.Audiences = &AudiencesService{client: c}
	c.Contacts = &ContactsService{client: c}

	return c
}

// Error represents an API error.
type Error struct {
	Message    string `json:"message"`
	Code       int    `json:"code"`
	StatusCode int    `json:"statusCode,omitempty"`
}

func (e *Error) Error() string {
	return fmt.Sprintf("unosend: %s (code: %d)", e.Message, e.Code)
}

func (c *Client) request(method, path string, body interface{}, result interface{}) error {
	url := c.baseURL + path

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", userAgent)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		var apiError struct {
			Error Error `json:"error"`
		}
		if err := json.Unmarshal(respBody, &apiError); err != nil {
			return &Error{Message: string(respBody), Code: resp.StatusCode, StatusCode: resp.StatusCode}
		}
		apiError.Error.StatusCode = resp.StatusCode
		return &apiError.Error
	}

	if result != nil {
		var wrapper struct {
			Data json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(respBody, &wrapper); err != nil {
			// Try direct unmarshal
			return json.Unmarshal(respBody, result)
		}
		if wrapper.Data != nil {
			return json.Unmarshal(wrapper.Data, result)
		}
		return json.Unmarshal(respBody, result)
	}

	return nil
}
