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

    // ── Sécurité : validation du format email ──────────────────────────────

    public function testLoginWithInvalidEmailFormat(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'not-an-email',
                'password' => 'somePassword1',
            ])
        );

        $this->assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertStringContainsStringIgnoringCase('email', $data['message']);
    }

    public function testLoginWithMissingCredentials(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'admin@miralabs.com'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    // ── Sécurité : protection brute-force ─────────────────────────────────

    /**
     * Simule 5 tentatives échouées consécutives et vérifie le blocage (HTTP 429).
     *
     * Note : Ce test est isolé par IP simulée (127.0.0.1 par défaut avec WebTestCase).
     * En CI, chaque classe de test tourne dans un processus séparé → le cache est vierge
     * au démarrage, donc le test est déterministe.
     */
    public function testBruteForceBlocking(): void
    {
        $client = static::createClient();

        $payload = json_encode([
            'email'    => 'wrong@attacker.com',
            'password' => 'WrongPassword1!',
        ]);
        $headers = ['CONTENT_TYPE' => 'application/json'];

        // 5 tentatives échouées
        for ($i = 0; $i < 5; $i++) {
            $client->request('POST', '/api/auth/login', [], [], $headers, $payload);
        }

        // La 6e tentative doit retourner 429
        $client->request('POST', '/api/auth/login', [], [], $headers, $payload);

        $this->assertResponseStatusCodeSame(429);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('retry_after', $data);
        $this->assertGreaterThan(0, $data['retry_after']);
    }

    // ── Sécurité : forgot-password anti-énumération ───────────────────────

    /**
     * L'endpoint /forgot-password doit retourner 200 même pour un email inexistant
     * afin de ne pas permettre l'énumération des comptes.
     */
    public function testForgotPasswordAntiEnumeration(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/forgot-password', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'ghost@nobody.io'])
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $data);
    }

    public function testForgotPasswordWithInvalidEmailFormat(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/forgot-password', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'not-valid'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    // ── Sécurité : reset-password validation ──────────────────────────────

    public function testResetPasswordWithInvalidToken(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/reset-password', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'token'    => str_repeat('a', 64), // token hexadécimal valide en longueur, mais inexistant
                'password' => 'NewPassword1',
            ])
        );

        $this->assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertStringContainsStringIgnoringCase('invalide', $data['message']);
    }

    public function testResetPasswordWithWeakPassword(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/reset-password', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'token'    => str_repeat('b', 64),
                'password' => 'weak', // trop court, pas de majuscule, pas de chiffre
            ])
        );

        $this->assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertNotEmpty($data['message']);
    }

    public function testResetPasswordWithMissingFields(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/auth/reset-password', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => str_repeat('c', 64)])
        );

        $this->assertResponseStatusCodeSame(400);
    }
}
