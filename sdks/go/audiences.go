package unosend

// Audience represents a contact list.
type Audience struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ContactCount int    `json:"contactCount"`
	CreatedAt    string `json:"createdAt"`
}

// AudiencesService handles audience operations.
type AudiencesService struct {
	client *Client
}

// Create creates a new audience.
func (s *AudiencesService) Create(name string) (*Audience, error) {
	var audience Audience
	err := s.client.request("POST", "/audiences", map[string]string{"name": name}, &audience)
	if err != nil {
		return nil, err
	}
	return &audience, nil
}

// Get retrieves an audience by ID.
func (s *AudiencesService) Get(id string) (*Audience, error) {
	var audience Audience
	err := s.client.request("GET", "/audiences/"+id, nil, &audience)
	if err != nil {
		return nil, err
	}
	return &audience, nil
}

// List retrieves all audiences.
func (s *AudiencesService) List() ([]Audience, error) {
	var audiences []Audience
	err := s.client.request("GET", "/audiences", nil, &audiences)
	if err != nil {
		return nil, err
	}
	return audiences, nil
}

// Delete removes an audience.
func (s *AudiencesService) Delete(id string) error {
	return s.client.request("DELETE", "/audiences/"+id, nil, nil)
}
