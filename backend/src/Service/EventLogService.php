<?php

namespace App\Service;

use App\Entity\EventLog;
use App\Entity\User;
use App\Entity\Etablissement;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service central d'enregistrement des événements.
 * Utilisé par tous les controllers pour logger les actions importantes.
 *
 * Usage :
 *   $this->eventLog->log(
 *       type: EventLog::LOGIN,
 *       user: $user,
 *       metadata: ['ip' => $request->getClientIp()]
 *   );
 */
class EventLogService
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function log(
        string        $type,
        ?User         $user = null,
        ?Etablissement $etablissement = null,
        array         $metadata = [],
    ): void {
        // Récupère l'établissement depuis l'utilisateur si non fourni
        if (!$etablissement && $user) {
            $etablissement = $user->getEtablissement();
        }

        $event = new EventLog();
        $event->setEventType($type);
        $event->setUserAccount($user);
        $event->setEtablissement($etablissement);
        $event->setMetadata(empty($metadata) ? null : $metadata);
        $event->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($event);
        $this->em->flush();
    }
}