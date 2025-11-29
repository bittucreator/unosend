<?php

declare(strict_types=1);

namespace Unosend;

class Contacts
{
    private Unosend $client;

    public function __construct(Unosend $client)
    {
        $this->client = $client;
    }

    /**
     * Create a new contact
     *
     * @param array{
     *   audienceId: string,
     *   email: string,
     *   firstName?: string,
     *   lastName?: string
     * } $params
     * @return array The created contact
     * @throws UnosendException
     */
    public function create(array $params): array
    {
        return $this->client->request('POST', '/contacts', $params);
    }

    /**
     * Get a contact by ID
     *
     * @param string $id Contact ID
     * @return array The contact
     * @throws UnosendException
     */
    public function get(string $id): array
    {
        return $this->client->request('GET', "/contacts/{$id}");
    }

    /**
     * List contacts in an audience
     *
     * @param string $audienceId Audience ID
     * @return array List of contacts
     * @throws UnosendException
     */
    public function list(string $audienceId): array
    {
        return $this->client->request('GET', "/contacts?audienceId={$audienceId}");
    }

    /**
     * Update a contact
     *
     * @param string $id Contact ID
     * @param array{
     *   firstName?: string,
     *   lastName?: string,
     *   unsubscribed?: bool
     * } $params
     * @return array The updated contact
     * @throws UnosendException
     */
    public function update(string $id, array $params): array
    {
        return $this->client->request('PATCH', "/contacts/{$id}", $params);
    }

    /**
     * Delete a contact
     *
     * @param string $id Contact ID
     * @return array Deletion confirmation
     * @throws UnosendException
     */
    public function delete(string $id): array
    {
        return $this->client->request('DELETE', "/contacts/{$id}");
    }
}
