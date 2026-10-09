<?php

namespace App\Controller;

use App\Entity\Note;
use App\Repository\NoteRepository;
use App\Repository\UserRepository;
use App\Repository\MatiereRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/notes')]
class NoteController extends AbstractController
{
    use EtablissementTrait;
    public function __construct(
        private EntityManagerInterface $em,
        private NoteRepository $noteRepository,
        private UserRepository $userRepository,
        private MatiereRepository $matiereRepository,
        private ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'notes_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles) || in_array('ROLE_TEACHER', $roles)) {
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
    #[IsGranted('ROLE_TEACHER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['valeur'], $data['eleveId'], $data['matiereId'])) {
            return $this->json(['message' => 'Données manquantes.'], 400);
        }

        // Validation de la valeur numérique (OWASP A03)
        $noteSur = (float) ($data['noteSur'] ?? 20);
        $errors = $this->validator->validate($data['valeur'], [
            new Assert\NotNull(),
            new Assert\Type(type: 'numeric', message: 'La note doit être un nombre.'),
            new Assert\Range(min: 0, max: $noteSur,
                notInRangeMessage: 'La note doit être entre 0 et {{ max }}.'),
        ]);
        if (count($errors) > 0) {
            return $this->json(['message' => $errors[0]->getMessage()], 400);
        }

        // Validation eleveId / matiereId entiers positifs
        foreach (['eleveId', 'matiereId'] as $field) {
            $errs = $this->validator->validate($data[$field], [
                new Assert\NotNull(),
                new Assert\Positive(message: "Le champ $field doit être un entier positif."),
            ]);
            if (count($errs) > 0) {
                return $this->json(['message' => $errs[0]->getMessage()], 400);
            }
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
            ->setTypeEvaluation($data['typeEvaluation'] ?? null)
            ->setEleve($eleve)
            ->setProfesseur($this->getUser())
            ->setMatiere($matiere)
            ->setCreatedAt(new \DateTimeImmutable());

        if (!empty($data['sessionId'])) {
            $session = $this->em->getRepository(\App\Entity\SessionNotes::class)->find($data['sessionId']);
            if ($session) $note->setSession($session);
        }

        $this->noteRepository->save($note, true);

        return $this->json($this->formatNote($note), 201);
    }

    #[Route('/{id}', name: 'notes_update', methods: ['PUT'])]
    #[IsGranted('ROLE_TEACHER')]
    public function update(int $id, Request $request): JsonResponse
    {
        $note = $this->noteRepository->find($id);
        if (!$note) {
            return $this->json(['message' => 'Note introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['valeur'])) $note->setValeur($data['valeur']);
        if (isset($data['commentaire'])) $note->setCommentaire($data['commentaire']);
        if (isset($data['typeEvaluation'])) $note->setTypeEvaluation($data['typeEvaluation']);
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
            'typeEvaluation' => $note->getTypeEvaluation(),
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