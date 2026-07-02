<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Repository\NotificationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(
        private NotificationRepository $notifRepo,
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
    ) {}

    /**
     * Liste les notifications du user connecté
     */
    #[Route('', name: 'notif_list', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $notifs = $this->notifRepo->findBy(
            ['recipient' => $user],
            ['createAt' => 'DESC'],
            20
        );

        return $this->json(array_map(fn(Notification $n) => [
            'id'        => $n->getId(),
            'type'      => $n->getType(),
            'title'     => $n->getTitle(),
            'message'   => $n->getMessage(),
            'isRead'    => $n->isRead(),
            'link'      => $n->getLink(),
            'createdAt' => $n->getCreateAt()?->format('d/m/Y H:i'),
            'sender'    => [
                'id'        => $n->getSender()->getId(),
                'firstName' => $n->getSender()->getFirstName(),
                'lastName'  => $n->getSender()->getLastName(),
            ],
        ], $notifs));
    }

    /**
     * Nombre de notifications non lues
     */
    #[Route('/unread-count', name: 'notif_unread_count', methods: ['GET'])]
    public function unreadCount(#[CurrentUser] User $user): JsonResponse
    {
        $count = $this->notifRepo->count([
            'recipient' => $user,
            'isRead'    => false,
        ]);

        return $this->json(['count' => $count]);
    }

    /**
     * Marquer une notification comme lue
     */
    #[Route('/{id}/read', name: 'notif_read', methods: ['PATCH'])]
    public function markRead(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $notif = $this->notifRepo->find($id);

        if (!$notif || $notif->getRecipient()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Notification introuvable.'], 404);
        }

        $notif->setIsRead(true);
        $this->em->flush();

        return $this->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    #[Route('/read-all', name: 'notif_read_all', methods: ['PATCH'])]
    public function markAllRead(#[CurrentUser] User $user): JsonResponse
    {
        $notifs = $this->notifRepo->findBy([
            'recipient' => $user,
            'isRead'    => false,
        ]);

        foreach ($notifs as $n) {
            $n->setIsRead(true);
        }
        $this->em->flush();

        return $this->json(['message' => count($notifs) . ' notification(s) marquée(s) comme lues.']);
    }

    /**
     * Envoyer une notification (usage interne — appelé par les autres controllers)
     * Accessible aussi via API pour tests
     */
    #[Route('/send', name: 'notif_send', methods: ['POST'])]
    public function send(Request $request, #[CurrentUser] User $sender): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $required = ['recipientId', 'type', 'title', 'message'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['message' => "Champ '$field' requis."], 400);
            }
        }

        $recipient = $this->userRepo->find($data['recipientId']);
        if (!$recipient) {
            return $this->json(['message' => 'Destinataire introuvable.'], 404);
        }

        $notif = new Notification();
        $notif->setSender($sender);
        $notif->setRecipient($recipient);
        $notif->setType($data['type']);
        $notif->setTitle($data['title']);
        $notif->setMessage($data['message']);
        $notif->setIsRead(false);
        $notif->setLink($data['link'] ?? null);
        $notif->setCreateAt(new \DateTimeImmutable());

        $this->em->persist($notif);
        $this->em->flush();

        return $this->json(['message' => 'Notification envoyée.'], 201);
    }

    /**
     * Supprimer une notification
     */
    #[Route('/{id}', name: 'notif_delete', methods: ['DELETE'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $notif = $this->notifRepo->find($id);

        if (!$notif || $notif->getRecipient()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Notification introuvable.'], 404);
        }

        $this->em->remove($notif);
        $this->em->flush();

        return $this->json(['message' => 'Notification supprimée.']);
    }
}