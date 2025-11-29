package unosend

// Domain represents a sending domain.
type Domain struct {
	ID        string      `json:"id"`
	Name      string      `json:"name"`
	Status    string      `json:"status"`
	Records   []DNSRecord `json:"records"`
	CreatedAt string      `json:"createdAt"`
}

// DNSRecord represents a DNS record for domain verification.
type DNSRecord struct {
	Type  string `json:"type"`
	Name  string `json:"name"`
	Value string `json:"value"`
	TTL   int    `json:"ttl"`
}

// DomainsService handles domain operations.
type DomainsService struct {
	client *Client
}

// Create adds a new domain.
func (s *DomainsService) Create(name string) (*Domain, error) {
	var domain Domain
	err := s.client.request("POST", "/domains", map[string]string{"name": name}, &domain)
	if err != nil {
		return nil, err
	}
	return &domain, nil
}

// Get retrieves a domain by ID.
func (s *DomainsService) Get(id string) (*Domain, error) {
	var domain Domain
	err := s.client.request("GET", "/domains/"+id, nil, &domain)
	if err != nil {
		return nil, err
	}
	return &domain, nil
}

// List retrieves all domains.
func (s *DomainsService) List() ([]Domain, error) {
	var domains []Domain
	err := s.client.request("GET", "/domains", nil, &domains)
	if err != nil {
		return nil, err
	}
	return domains, nil
}

// Verify triggers DNS verification for a domain.
func (s *DomainsService) Verify(id string) (*Domain, error) {
	var domain Domain
	err := s.client.request("POST", "/domains/"+id+"/verify", nil, &domain)
	if err != nil {
		return nil, err
	}
	return &domain, nil
}

// Delete removes a domain.
func (s *DomainsService) Delete(id string) error {
	return s.client.request("DELETE", "/domains/"+id, nil, nil)
}
