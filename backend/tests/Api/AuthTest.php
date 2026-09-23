<?php
namespace App\Tests\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthTest extends WebTestCase
{
    public function testLoginWithValidCredentials(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'admin@miralabs.com',
                'password' => 'superadmin123',
                'etablissementId' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'wrong@email.com',
                'password' => 'wrongpassword',
                'etablissementId' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }

    public function testProtectedRouteWithoutToken(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/notes');
        $this->assertResponseStatusCodeSame(401);
    }
}
