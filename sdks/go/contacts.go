package unosend

// Contact represents a contact in an audience.
type Contact struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	FirstName    string `json:"firstName,omitempty"`
	LastName     string `json:"lastName,omitempty"`
	Unsubscribed bool   `json:"unsubscribed"`
	CreatedAt    string `json:"createdAt"`
}

// CreateContactRequest represents a request to create a contact.
type CreateContactRequest struct {
	AudienceID string `json:"audienceId"`
	Email      string `json:"email"`
	FirstName  string `json:"firstName,omitempty"`
	LastName   string `json:"lastName,omitempty"`
}

// UpdateContactRequest represents a request to update a contact.
type UpdateContactRequest struct {
	FirstName    *string `json:"firstName,omitempty"`
	LastName     *string `json:"lastName,omitempty"`
	Unsubscribed *bool   `json:"unsubscribed,omitempty"`
}

// ContactsService handles contact operations.
type ContactsService struct {
	client *Client
}

// Create creates a new contact.
func (s *ContactsService) Create(req *CreateContactRequest) (*Contact, error) {
	var contact Contact
	err := s.client.request("POST", "/contacts", req, &contact)
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

// Get retrieves a contact by ID.
func (s *ContactsService) Get(id string) (*Contact, error) {
	var contact Contact
	err := s.client.request("GET", "/contacts/"+id, nil, &contact)
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

// List retrieves contacts in an audience.
func (s *ContactsService) List(audienceID string) ([]Contact, error) {
	var contacts []Contact
	err := s.client.request("GET", "/contacts?audienceId="+audienceID, nil, &contacts)
	if err != nil {
		return nil, err
	}
	return contacts, nil
}

// Update updates a contact.
func (s *ContactsService) Update(id string, req *UpdateContactRequest) (*Contact, error) {
	var contact Contact
	err := s.client.request("PATCH", "/contacts/"+id, req, &contact)
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

// Delete removes a contact.
func (s *ContactsService) Delete(id string) error {
	return s.client.request("DELETE", "/contacts/"+id, nil, nil)
}
