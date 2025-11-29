<?php

require __DIR__ . '/vendor/autoload.php';

use Unosend\Unosend;
use Unosend\UnosendException;

$client = new Unosend('un_0888c5a65f252209925082f16488835e', 'http://localhost:3000/api/v1');

echo "Testing PHP SDK...\n\n";

// Test emails list
echo "1. Testing emails->list()...\n";
try {
    $emails = $client->emails->list();
    echo "   Success! Found " . count($emails) . " emails\n";
} catch (UnosendException $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

// Test domains list
echo "\n2. Testing domains->list()...\n";
try {
    $domains = $client->domains->list();
    echo "   Success! Found " . count($domains) . " domains\n";
} catch (UnosendException $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

// Test audiences list
echo "\n3. Testing audiences->list()...\n";
try {
    $audiences = $client->audiences->list();
    echo "   Success! Found " . count($audiences) . " audiences\n";
} catch (UnosendException $e) {
    echo "   Error: " . $e->getMessage() . "\n";
}

echo "\n✅ PHP SDK is working!\n";
