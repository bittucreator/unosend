<?php

declare(strict_types=1);

namespace Unosend;

class UnosendException extends \Exception
{
    private ?int $statusCode;

    public function __construct(string $message, int $code = 0, ?int $statusCode = null, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->statusCode = $statusCode;
    }

    public function getStatusCode(): ?int
    {
        return $this->statusCode;
    }
}
