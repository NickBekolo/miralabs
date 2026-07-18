<?php
namespace App\Controller;

use App\Entity\Lecon;
use App\Entity\Matiere;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/lecons')]
#[IsGranted('ROLE_TEACHER')]
class LeconController extends AbstractController
{
    use EtablissementTrait;
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $etab = $this->getEtablissement($em);
        $qb = $em->getRepository(Lecon::class)->createQueryBuilder('l')
            ->where('l.enseignant = :user')->setParameter('user', $this->getUser());
        if ($etab) $qb->andWhere('l.etablissement = :etab')->setParameter('etab', $etab);
        $lecons = $qb->orderBy('l.date', 'DESC')->getQuery()->getResult();
        return $this->json(array_map(fn($l) => [
            'id'        => $l->getId(),
            'titre'     => $l->getTitre(),
            'contenu'   => $l->getContenu(),
            'objectifs' => $l->getObjectifs(),
            'date'      => $l->getDate()?->format('Y-m-d'),
            'classe'    => $l->getClasse(),
            'matiere'   => $l->getMatiere() ? ['id'=>$l->getMatiere()->getId(),'nom'=>$l->getMatiere()->getNom()] : null,
        ], $lecons));
    }

    #[Route('', methods:['POST'])]
    public function create(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $lecon = new Lecon();
        $lecon->setTitre($data['titre'] ?? '');
        $lecon->setContenu($data['contenu'] ?? null);
        $lecon->setObjectifs($data['objectifs'] ?? null);
        $lecon->setClasse($data['classe'] ?? null);
        $lecon->setDate(new \DateTime($data['date'] ?? 'now'));
        $lecon->setEnseignant($this->getUser());
        if (!empty($data['matiereId'])) {
            $matiere = $em->getRepository(Matiere::class)->find($data['matiereId']);
            $lecon->setMatiere($matiere);
        }
        $lecon->setEtablissement($this->getEtablissement($em));
        $em->persist($lecon);
        $em->flush();
        return $this->json(['id' => $lecon->getId(), 'message' => 'Leçon créée'], 201);
    }

    #[Route('/{id}', methods:['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $lecon = $em->getRepository(Lecon::class)->find($id);
        if (!$lecon || $lecon->getEnseignant() !== $this->getUser()) {
            return $this->json(['error' => 'Non trouvée'], 404);
        }
        $em->remove($lecon);
        $em->flush();
        return $this->json(['message' => 'Supprimée']);
    }
}
