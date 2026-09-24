<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/mira')]
#[IsGranted('ROLE_USER')]
class MiraController extends AbstractController
{
    const MODELS = [
        'claude-haiku'  => ['provider' => 'anthropic', 'model' => 'claude-haiku-4-5-20251001', 'label' => 'Claude Haiku'],
        'claude-sonnet' => ['provider' => 'anthropic', 'model' => 'claude-sonnet-4-6',          'label' => 'Claude Sonnet'],
        'gpt-4o-mini'   => ['provider' => 'openai',    'model' => 'gpt-4o-mini',                'label' => 'GPT-4o Mini'],
        'gpt-4o'        => ['provider' => 'openai',    'model' => 'gpt-4o',                     'label' => 'GPT-4o'],
    ];

    #[Route('/models', methods: ['GET'])]
    public function models(): JsonResponse
    {
        $list = [];
        foreach (self::MODELS as $key => $m) {
            $list[] = ['key' => $key, 'label' => $m['label'], 'provider' => $m['provider']];
        }
        return $this->json($list);
    }

    #[Route('', methods: ['POST'])]
    public function chat(Request $request): JsonResponse
    {
        $data      = json_decode($request->getContent(), true);
        $messages  = $data['messages'] ?? [];
        $system    = $data['system'] ?? '';
        $modelKey  = $data['model'] ?? 'claude-haiku';

        $config   = self::MODELS[$modelKey] ?? self::MODELS['claude-haiku'];
        $provider = $config['provider'];
        $model    = $config['model'];

        if ($provider === 'openai') {
            $apiKey = $_ENV['OPENAI_API_KEY'] ?? null;
            if (!$apiKey) return $this->json(['error' => 'Clé OpenAI manquante dans .env'], 500);

            $openaiMessages = [];
            if (!empty($system)) $openaiMessages[] = ['role' => 'system', 'content' => $system];
            foreach ($messages as $msg) {
                $openaiMessages[] = ['role' => $msg['role'], 'content' => $msg['content']];
            }

            $payload = ['model' => $model, 'max_tokens' => 1000, 'messages' => $openaiMessages];

            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($payload),
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . $apiKey],
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) return $this->json(['error' => 'Erreur OpenAI', 'details' => $response], $httpCode);
            $result = json_decode($response, true);
            $text   = $result['choices'][0]['message']['content'] ?? "Désolé, je n'ai pas pu répondre.";

        } else {
            $apiKey = $_ENV['ANTHROPIC_API_KEY'] ?? null;
            if (!$apiKey) return $this->json(['error' => 'Clé Anthropic manquante dans .env'], 500);

            $payload = ['model' => $model, 'max_tokens' => 1000, 'system' => $system, 'messages' => $messages];

            $ch = curl_init('https://api.anthropic.com/v1/messages');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($payload),
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'x-api-key: ' . $apiKey, 'anthropic-version: 2023-06-01'],
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) return $this->json(['error' => 'Erreur Anthropic', 'details' => $response], $httpCode);
            $result = json_decode($response, true);
            $text   = $result['content'][0]['text'] ?? "Désolé, je n'ai pas pu répondre.";
        }

        return $this->json(['text' => $text, 'model' => $config['label'], 'provider' => $provider]);
    }
}
