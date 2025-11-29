<?php

declare(strict_types=1);

namespace Unosend;

class Emails
{
    private Unosend $client;

    public function __construct(Unosend $client)
    {
        $this->client = $client;
    }

    /**
     * Send an email
     *
     * @param array{
     *   from: string,
     *   to: string|string[],
     *   subject: string,
     *   html?: string,
     *   text?: string,
     *   replyTo?: string,
     *   cc?: string|string[],
     *   bcc?: string|string[],
     *   headers?: array<string, string>,
     *   tags?: array<array{name: string, value: string}>
     * } $params
     * @return array The sent email
     * @throws UnosendException
     */
    public function send(array $params): array
    {
        $payload = [
            'from' => $params['from'],
            'to' => is_array($params['to']) ? $params['to'] : [$params['to']],
            'subject' => $params['subject'],
        ];

        if (isset($params['html'])) $payload['html'] = $params['html'];
        if (isset($params['text'])) $payload['text'] = $params['text'];
        if (isset($params['replyTo'])) $payload['replyTo'] = $params['replyTo'];
        if (isset($params['cc'])) $payload['cc'] = is_array($params['cc']) ? $params['cc'] : [$params['cc']];
        if (isset($params['bcc'])) $payload['bcc'] = is_array($params['bcc']) ? $params['bcc'] : [$params['bcc']];
        if (isset($params['headers'])) $payload['headers'] = $params['headers'];
        if (isset($params['tags'])) $payload['tags'] = $params['tags'];

        return $this->client->request('POST', '/emails', $payload);
    }

    /**
     * Get an email by ID
     *
     * @param string $id Email ID
     * @return array The email
     * @throws UnosendException
     */
    public function get(string $id): array
    {
        return $this->client->request('GET', "/emails/{$id}");
    }

    /**
     * List emails
     *
     * @param int|null $limit Maximum number of results
     * @param int|null $offset Offset for pagination
     * @return array List of emails
     * @throws UnosendException
     */
    public function list(?int $limit = null, ?int $offset = null): array
    {
        $query = [];
        if ($limit !== null) $query['limit'] = $limit;
        if ($offset !== null) $query['offset'] = $offset;

        $path = '/emails';
        if (!empty($query)) {
            $path .= '?' . http_build_query($query);
        }

        return $this->client->request('GET', $path);
    }
}
