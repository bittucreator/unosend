<?php

declare(strict_types=1);

namespace Unosend;

use GuzzleHttp\Client as HttpClient;
use GuzzleHttp\Exception\GuzzleException;

class Unosend
{
    private const DEFAULT_BASE_URL = 'https://api.unosend.com/v1';
    private const USER_AGENT = 'unosend-php/1.0.0';

    private string $apiKey;
    private string $baseUrl;
    private HttpClient $httpClient;

    public readonly Emails $emails;
    public readonly Domains $domains;
    public readonly Audiences $audiences;
    public readonly Contacts $contacts;

    public function __construct(string $apiKey, ?string $baseUrl = null)
    {
        if (empty($apiKey)) {
            throw new \InvalidArgumentException('API key is required');
        }

        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl ?? self::DEFAULT_BASE_URL;
        $this->httpClient = new HttpClient([
            'base_uri' => $this->baseUrl,
            'timeout' => 30,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'User-Agent' => self::USER_AGENT,
            ],
        ]);

        $this->emails = new Emails($this);
        $this->domains = new Domains($this);
        $this->audiences = new Audiences($this);
        $this->contacts = new Contacts($this);
    }

    /**
     * @throws UnosendException
     */
    public function request(string $method, string $path, ?array $body = null): array
    {
        try {
            $options = [];
            if ($body !== null) {
                $options['json'] = $body;
            }

            $response = $this->httpClient->request($method, $path, $options);
            $data = json_decode($response->getBody()->getContents(), true);

            return $data['data'] ?? $data;
        } catch (GuzzleException $e) {
            $response = method_exists($e, 'getResponse') ? $e->getResponse() : null;
            
            if ($response) {
                $body = json_decode($response->getBody()->getContents(), true);
                $error = $body['error'] ?? [];
                
                throw new UnosendException(
                    $error['message'] ?? 'Unknown error',
                    $error['code'] ?? $response->getStatusCode(),
                    $response->getStatusCode()
                );
            }

            throw new UnosendException($e->getMessage(), 0);
        }
    }
}
