package unosend

import "fmt"

// Email represents an email.
type Email struct {
	ID        string   `json:"id"`
	From      string   `json:"from"`
	To        []string `json:"to"`
	Subject   string   `json:"subject"`
	Status    string   `json:"status"`
	CreatedAt string   `json:"createdAt"`
}

// SendEmailRequest represents a request to send an email.
type SendEmailRequest struct {
	From        string            `json:"from"`
	To          []string          `json:"to"`
	Subject     string            `json:"subject"`
	HTML        string            `json:"html,omitempty"`
	Text        string            `json:"text,omitempty"`
	ReplyTo     string            `json:"replyTo,omitempty"`
	CC          []string          `json:"cc,omitempty"`
	BCC         []string          `json:"bcc,omitempty"`
	Headers     map[string]string `json:"headers,omitempty"`
	Tags        []Tag             `json:"tags,omitempty"`
	Attachments []Attachment      `json:"attachments,omitempty"`
}

// Tag represents an email tag.
type Tag struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// Attachment represents an email attachment.
type Attachment struct {
	Filename    string `json:"filename"`
	Content     string `json:"content"`
	ContentType string `json:"contentType,omitempty"`
}

// EmailsService handles email operations.
type EmailsService struct {
	client *Client
}

// Send sends an email.
func (s *EmailsService) Send(req *SendEmailRequest) (*Email, error) {
	var email Email
	err := s.client.request("POST", "/emails", req, &email)
	if err != nil {
		return nil, err
	}
	return &email, nil
}

// Get retrieves an email by ID.
func (s *EmailsService) Get(id string) (*Email, error) {
	var email Email
	err := s.client.request("GET", "/emails/"+id, nil, &email)
	if err != nil {
		return nil, err
	}
	return &email, nil
}

// ListOptions specifies options for listing resources.
type ListOptions struct {
	Limit  int
	Offset int
}

// List retrieves a list of emails.
func (s *EmailsService) List(opts *ListOptions) ([]Email, error) {
	path := "/emails"
	if opts != nil {
		path = fmt.Sprintf("/emails?limit=%d&offset=%d", opts.Limit, opts.Offset)
	}

	var emails []Email
	err := s.client.request("GET", path, nil, &emails)
	if err != nil {
		return nil, err
	}
	return emails, nil
}
