<?php
namespace App\Controller;

use App\Entity\SessionNotes;
use App\Entity\Note;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/sessions-notes')]
class SessionNotesController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $sessions = $this->em->getRepository(SessionNotes::class)
            ->findBy(['enseignant' => $user], ['createdAt' => 'DESC']);

        return $this->json(array_map(fn(SessionNotes $s) => [
            'id'             => $s->getId(),
            'classe'         => $s->getClasse() ? ['id'=>$s->getClasse()->getId(),'name'=>$s->getClasse()->getName()] : null,
            'matiere'        => $s->getMatiere() ? ['id'=>$s->getMatiere()->getId(),'nom'=>$s->getMatiere()->getNom()] : null,
            'typeEvaluation' => $s->getTypeEvaluation(),
            'dateSession'    => $s->getDateSession()?->format('Y-m-d'),
            'noteSur'        => $s->getNoteSur(),
            'statut'         => $s->getStatut(),
            'createdAt'      => $s->getCreatedAt()->format('d/m/Y H:i'),
            'nbNotes'        => $s->getNotes()->count(),
        ], $sessions));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $session = new SessionNotes();
        $session->setEnseignant($user);
        $session->setTypeEvaluation($data['typeEvaluation'] ?? null);
        $session->setNoteSur($data['noteSur'] ?? 20);
        $session->setDateSession(new \DateTime($data['dateSession'] ?? 'now'));

        if (!empty($data['classeId'])) {
            $classe = $this->em->getRepository(\App\Entity\Classe::class)->find($data['classeId']);
            if ($classe) $session->setClasse($classe);
        }
        if (!empty($data['matiereId'])) {
            $matiere = $this->em->getRepository(\App\Entity\Matiere::class)->find($data['matiereId']);
            if ($matiere) $session->setMatiere($matiere);
        }

        $this->em->persist($session);
        $this->em->flush();

        return $this->json([
            'id'             => $session->getId(),
            'classe'         => $session->getClasse() ? ['id'=>$session->getClasse()->getId(),'name'=>$session->getClasse()->getName()] : null,
            'matiere'        => $session->getMatiere() ? ['id'=>$session->getMatiere()->getId(),'nom'=>$session->getMatiere()->getNom()] : null,
            'typeEvaluation' => $session->getTypeEvaluation(),
            'dateSession'    => $session->getDateSession()?->format('Y-m-d'),
            'noteSur'        => $session->getNoteSur(),
            'statut'         => $session->getStatut(),
        ], 201);
    }

    #[Route('/{id}/notes', methods: ['GET'])]
    public function notes(int $id): JsonResponse
    {
        $session = $this->em->getRepository(SessionNotes::class)->find($id);
        if (!$session) return $this->json(['message' => 'Session introuvable'], 404);

        $notes = $session->getNotes()->toArray();
        return $this->json(array_map(fn(Note $n) => [
            'id'             => $n->getId(),
            'valeur'         => $n->getValeur(),
            'noteSur'        => $n->getNoteSur(),
            'commentaire'    => $n->getCommentaire(),
            'typeEvaluation' => $n->getTypeEvaluation(),
            'createdAt'      => $n->getCreatedAt()?->format('d/m/Y'),
            'eleve'          => $n->getEleve() ? ['id'=>$n->getEleve()->getId(),'firstName'=>$n->getEleve()->getFirstName(),'lastName'=>$n->getEleve()->getLastName(),'genre'=>$n->getEleve()->getGenre()] : null,
        ], $notes));
    }

    #[Route('/{id}/soumettre', methods: ['PATCH'])]
    public function soumettre(int $id): JsonResponse
    {
        $session = $this->em->getRepository(SessionNotes::class)->find($id);
        if (!$session) return $this->json(['message' => 'Session introuvable'], 404);
        $session->setStatut('soumise');
        $this->em->flush();
        return $this->json(['statut' => 'soumise']);
    }
}
