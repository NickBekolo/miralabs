<?php
namespace App\Controller;

use App\Entity\MiraConversation;
use App\Repository\MiraConversationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/mira/conversations')]
class MiraConversationController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $convs = $this->em->getRepository(MiraConversation::class)
            ->findBy(['user' => $user], ['updatedAt' => 'DESC']);

        return $this->json(array_map(fn($c) => [
            'id'        => $c->getId(),
            'title'     => $c->getTitle() ?? 'Nouvelle conversation',
            'model'     => $c->getModel(),
            'updatedAt' => $c->getUpdatedAt()->format('Y-m-d H:i:s'),
            'preview'   => $c->getMessages()[0]['text'] ?? '',
        ], $convs));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $conv = new MiraConversation();
        $conv->setUser($user);
        $conv->setMessages($data['messages'] ?? []);
        $conv->setModel($data['model'] ?? 'claude-haiku');
        $conv->setTitle($data['title'] ?? null);
        $this->em->persist($conv);
        $this->em->flush();

        return $this->json(['id' => $conv->getId()], 201);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function get(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $conv = $this->em->getRepository(MiraConversation::class)->find($id);
        if (!$conv || $conv->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Introuvable'], 404);
        }
        return $this->json([
            'id'       => $conv->getId(),
            'title'    => $conv->getTitle() ?? 'Nouvelle conversation',
            'model'    => $conv->getModel(),
            'messages' => $conv->getMessages(),
        ]);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    public function update(int $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $conv = $this->em->getRepository(MiraConversation::class)->find($id);
        if (!$conv || $conv->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Introuvable'], 404);
        }
        $data = json_decode($request->getContent(), true);
        if (isset($data['messages'])) $conv->setMessages($data['messages']);
        if (isset($data['model']))    $conv->setModel($data['model']);
        if (isset($data['title']))    $conv->setTitle($data['title']);
        $conv->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['ok' => true]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $conv = $this->em->getRepository(MiraConversation::class)->find($id);
        if (!$conv || $conv->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Introuvable'], 404);
        }
        $this->em->remove($conv);
        $this->em->flush();
        return $this->json(['ok' => true]);
    }
}
