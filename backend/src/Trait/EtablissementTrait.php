<?php
namespace App\Trait;

use App\Entity\Etablissement;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;

trait EtablissementTrait
{
    private function getEtablissement(EntityManagerInterface $em): ?Etablissement
    {
        $user = $this->getUser();
        if (!$user) return null;
        return $user->getEtablissement();
    }

    private function filterByEtablissement(QueryBuilder $qb, EntityManagerInterface $em, string $alias = 'e'): QueryBuilder
    {
        $etab = $this->getEtablissement($em);
        if ($etab) {
            $qb->andWhere("$alias.etablissement = :etab")
               ->setParameter('etab', $etab);
        }
        return $qb;
    }
}
