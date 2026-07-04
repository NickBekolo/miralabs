<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $user, bool $flush = false): void
    {
        $this->getEntityManager()->persist($user);
        if ($flush) $this->getEntityManager()->flush();
    }

    /**
     * Nb d'utilisateurs créés avant une date
     */
    public function countCreatedBefore(\DateTimeImmutable $date): int
    {
        return (int) $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt <= :date')
            ->setParameter('date', $date->setTime(23, 59, 59))
            ->getQuery()
            ->getSingleScalarResult();
    }
}