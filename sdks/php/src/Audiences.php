<?php

declare(strict_types=1);

namespace Unosend;

class Audiences
{
    private Unosend $client;

    public function __construct(Unosend $client)
    {
        $this->client = $client;
    }

    /**
     * Create a new audience
     *
     * @param string $name Audience name
     * @return array The created audience
     * @throws UnosendException
     */
    public function create(string $name): array
    {
        return $this->client->request('POST', '/audiences', ['name' => $name]);
    }

    /**
     * Get an audience by ID
     *
     * @param string $id Audience ID
     * @return array The audience
     * @throws UnosendException
     */
    public function get(string $id): array
    {
        return $this->client->request('GET', "/audiences/{$id}");
    }

    /**
     * List all audiences
     *
     * @return array List of audiences
     * @throws UnosendException
     */
    public function list(): array
    {
        return $this->client->request('GET', '/audiences');
    }

    /**
     * Delete an audience
     *
     * @param string $id Audience ID
     * @return array Deletion confirmation
     * @throws UnosendException
     */
    public function delete(string $id): array
    {
        return $this->client->request('DELETE', "/audiences/{$id}");
    }
}
