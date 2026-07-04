<?php

namespace App\Repository;

use App\Entity\Etablissement;
use App\Entity\EventLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EventLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EventLog::class);
    }

    /**
     * Nb d'événements d'un type depuis une date
     */
    public function countByTypeAndDate(string $type, \DateTimeImmutable $since): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.eventType = :type')
            ->andWhere('e.createdAt >= :since')
            ->andWhere('e.createdAt < :until')
            ->setParameter('type', $type)
            ->setParameter('since', $since->setTime(0, 0, 0))
            ->setParameter('until', $since->setTime(23, 59, 59))
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Connexions par heure depuis une date
     */
    public function getLoginsByHour(\DateTimeImmutable $since): array
    {
        return $this->createQueryBuilder('e')
            ->select('HOUR(e.createdAt) as hour, COUNT(e.id) as count')
            ->where('e.eventType = :type')
            ->andWhere('e.createdAt >= :since')
            ->setParameter('type', EventLog::LOGIN)
            ->setParameter('since', $since)
            ->groupBy('hour')
            ->orderBy('hour', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Nb d'événements par établissement et type depuis une date
     */
    public function countByEtabAndType(Etablissement $etab, string $type, \DateTimeImmutable $since): int
    {
        return (int) $this->createQueryBuilder('e')
            ->select('COUNT(e.id)')
            ->where('e.etablissement = :etab')
            ->andWhere('e.eventType = :type')
            ->andWhere('e.createdAt >= :since')
            ->setParameter('etab', $etab)
            ->setParameter('type', $type)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }
}