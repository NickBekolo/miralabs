<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service central de notifications.
 * Utilisé par tous les controllers pour envoyer des notifications automatiques.
 *
 * Usage :
 *   $this->notifService->send(
 *       sender: $currentUser,
 *       recipientRoles: ['ROLE_SERVICE_PEDAGOGIQUE'],
 *       type: 'NOTE_CREATED',
 *       title: 'Nouvelle note saisie',
 *       message: 'M. Dupont a saisi une note en Maths pour 1ASSP1',
 *       link: '/notes/classe/1'
 *   );
 */
class NotificationService
{
    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
    ) {}

    /**
     * Envoie une notification à tous les utilisateurs ayant l'un des rôles donnés.
     *
     * @param User     $sender         L'expéditeur
     * @param string[] $recipientRoles Rôles Symfony ciblés (ex: ['ROLE_SERVICE_PEDAGOGIQUE'])
     * @param string   $type           Type d'événement (NOTE_CREATED, ABSENCE_CREATED, etc.)
     * @param string   $title          Titre court
     * @param string   $message        Corps du message
     * @param string|null $link        Lien de redirection (optionnel)
     */
    public function send(
        User $sender,
        array $recipientRoles,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
    ): void {
        $allUsers = $this->userRepo->findAll();

        foreach ($allUsers as $user) {
            foreach ($recipientRoles as $role) {
                if (in_array($role, $user->getRoles()) && $user->getId() !== $sender->getId()) {
                    $notif = new Notification();
                    $notif->setSender($sender);
                    $notif->setRecipient($user);
                    $notif->setType($type);
                    $notif->setTitle($title);
                    $notif->setMessage($message);
                    $notif->setIsRead(false);
                    $notif->setLink($link);
                    $notif->setCreateAt(new \DateTimeImmutable());
                    $this->em->persist($notif);
                    break; // évite les doublons si user a plusieurs rôles ciblés
                }
            }
        }

        $this->em->flush();
    }

    /**
     * Envoie une notification à un utilisateur spécifique par son ID.
     */
    public function sendToUser(
        User $sender,
        User $recipient,
        string $type,
        string $title,
        string $message,
        ?string $link = null,
    ): void {
        $notif = new Notification();
        $notif->setSender($sender);
        $notif->setRecipient($recipient);
        $notif->setType($type);
        $notif->setTitle($title);
        $notif->setMessage($message);
        $notif->setIsRead(false);
        $notif->setLink($link);
        $notif->setCreateAt(new \DateTimeImmutable());
        $this->em->persist($notif);
        $this->em->flush();
    }

    /**
     * Constantes des types de notifications
     */
    const NOTE_CREATED       = 'NOTE_CREATED';
    const ABSENCE_CREATED    = 'ABSENCE_CREATED';
    const EDT_PUBLISHED      = 'EDT_PUBLISHED';
    const BULLETIN_READY     = 'BULLETIN_READY';
    const DECISION_VALIDATED = 'DECISION_VALIDATED';
    const ABSENCE_ALERT      = 'ABSENCE_ALERT';
    const ACCOUNT_CREATED    = 'ACCOUNT_CREATED';
}