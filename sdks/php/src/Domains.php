<?php

declare(strict_types=1);

namespace Unosend;

class Domains
{
    private Unosend $client;

    public function __construct(Unosend $client)
    {
        $this->client = $client;
    }

    /**
     * Create a new domain
     *
     * @param string $name Domain name
     * @return array The created domain
     * @throws UnosendException
     */
    public function create(string $name): array
    {
        return $this->client->request('POST', '/domains', ['name' => $name]);
    }

    /**
     * Get a domain by ID
     *
     * @param string $id Domain ID
     * @return array The domain
     * @throws UnosendException
     */
    public function get(string $id): array
    {
        return $this->client->request('GET', "/domains/{$id}");
    }

    /**
     * List all domains
     *
     * @return array List of domains
     * @throws UnosendException
     */
    public function list(): array
    {
        return $this->client->request('GET', '/domains');
    }

    /**
     * Verify a domain
     *
     * @param string $id Domain ID
     * @return array The verified domain
     * @throws UnosendException
     */
    public function verify(string $id): array
    {
        return $this->client->request('POST', "/domains/{$id}/verify");
    }

    /**
     * Delete a domain
     *
     * @param string $id Domain ID
     * @return array Deletion confirmation
     * @throws UnosendException
     */
    public function delete(string $id): array
    {
        return $this->client->request('DELETE', "/domains/{$id}");
    }
}
