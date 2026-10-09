<?php

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class NoteControllerTest extends WebTestCase
{
    public function testCreateNoteRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request(
            'POST', '/api/notes', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['valeur' => 15, 'eleveId' => 1, 'matiereId' => 1])
        );
        $this->assertResponseStatusCodeSame(401);
    }

    public function testGetNotesRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/notes');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testDeleteNoteRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/notes/1');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testPutNoteRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request(
            'PUT', '/api/notes/1', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['valeur' => 18])
        );
        $this->assertResponseStatusCodeSame(401);
    }
}
