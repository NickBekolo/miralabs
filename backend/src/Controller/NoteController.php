<?php

namespace App\Controller;

use App\Entity\Note;
use App\Repository\NoteRepository;
use App\Repository\UserRepository;
use App\Repository\MatiereRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notes')]
class NoteController extends AbstractController
{
    public function __construct(
        private NoteRepository $noteRepository,
        private UserRepository $userRepository,
        private MatiereRepository $matiereRepository,
    ) {}

    #[Route('', name: 'notes_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles) || in_array('ROLE_PROF', $roles)) {
            $notes = $this->noteRepository->findAll();
        } else {
            $notes = $this->noteRepository->findByEleve($user->getId());
        }

        return $this->json($this->formatNotes($notes));
    }

    #[Route('/eleve/{id}', name: 'notes_by_eleve', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function byEleve(int $id): JsonResponse
    {
        $notes = $this->noteRepository->findByEleve($id);
        return $this->json($this->formatNotes($notes));
    }

    #[Route('', name: 'notes_create', methods: ['POST'])]
    #[IsGranted('ROLE_PROF')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['valeur'], $data['eleveId'], $data['matiereId'])) {
            return $this->json(['message' => 'Données manquantes.'], 400);
        }

        if ($data['valeur'] < 0 || $data['valeur'] > ($data['noteSur'] ?? 20)) {
            return $this->json(['message' => 'Note invalide.'], 400);
        }

        $eleve = $this->userRepository->find($data['eleveId']);
        $matiere = $this->matiereRepository->find($data['matiereId']);

        if (!$eleve || !$matiere) {
            return $this->json(['message' => 'Élève ou matière introuvable.'], 404);
        }

        $note = new Note();
        $note->setValeur($data['valeur'])
            ->setNoteSur($data['noteSur'] ?? 20)
            ->setCommentaire($data['commentaire'] ?? null)
            ->setEleve($eleve)
            ->setProfesseur($this->getUser())
            ->setMatiere($matiere)
            ->setCreatedAt(new \DateTimeImmutable());

        $this->noteRepository->save($note, true);

        return $this->json($this->formatNote($note), 201);
    }

    #[Route('/{id}', name: 'notes_update', methods: ['PUT'])]
    #[IsGranted('ROLE_PROF')]
    public function update(int $id, Request $request): JsonResponse
    {
        $note = $this->noteRepository->find($id);
        if (!$note) {
            return $this->json(['message' => 'Note introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['valeur'])) $note->setValeur($data['valeur']);
        if (isset($data['commentaire'])) $note->setCommentaire($data['commentaire']);
        if (isset($data['noteSur'])) $note->setNoteSur($data['noteSur']);

        $this->noteRepository->save($note, true);

        return $this->json($this->formatNote($note));
    }

    #[Route('/{id}', name: 'notes_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $note = $this->noteRepository->find($id);
        if (!$note) {
            return $this->json(['message' => 'Note introuvable.'], 404);
        }

        $this->noteRepository->remove($note, true);
        return $this->json(['message' => 'Note supprimée.']);
    }

    private function formatNote(Note $note): array
    {
        return [
            'id' => $note->getId(),
            'valeur' => $note->getValeur(),
            'noteSur' => $note->getNoteSur(),
            'commentaire' => $note->getCommentaire(),
            'createdAt' => $note->getCreatedAt()?->format('Y-m-d'),
            'eleve' => [
                'id' => $note->getEleve()->getId(),
                'firstName' => $note->getEleve()->getFirstName(),
                'lastName' => $note->getEleve()->getLastName(),
            ],
            'professeur' => [
                'id' => $note->getProfesseur()->getId(),
                'firstName' => $note->getProfesseur()->getFirstName(),
                'lastName' => $note->getProfesseur()->getLastName(),
            ],
            'matiere' => [
                'id' => $note->getMatiere()->getId(),
                'nom' => $note->getMatiere()->getNom(),
                'coefficient' => $note->getMatiere()->getCoefficient(),
            ],
        ];
    }

    private function formatNotes(array $notes): array
    {
        return array_map(fn($n) => $this->formatNote($n), $notes);
    }
}