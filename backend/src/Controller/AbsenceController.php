<?php

namespace App\Controller;

use App\Entity\Absence;
use App\Repository\AbsenceRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/absences')]
class AbsenceController extends AbstractController
{
    use EtablissementTrait;
    public function __construct(
        private AbsenceRepository $absenceRepository,
        private UserRepository $userRepository,
    ) {}

    #[Route('', name: 'absences_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function index(): JsonResponse
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles) || in_array('ROLE_TEACHER', $roles)) {
            $absences = $this->absenceRepository->findAll();
        } else {
            $absences = $this->absenceRepository->findByEleve($user->getId());
        }

        return $this->json($this->formatAbsences($absences));
    }

    #[Route('/eleve/{id}', name: 'absences_by_eleve', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function byEleve(int $id): JsonResponse
    {
        $absences = $this->absenceRepository->findByEleve($id);
        return $this->json($this->formatAbsences($absences));
    }

    #[Route('', name: 'absences_create', methods: ['POST'])]
    #[IsGranted('ROLE_TEACHER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['eleveId'], $data['date'])) {
            return $this->json(['message' => 'Données manquantes.'], 400);
        }

        $eleve = $this->userRepository->find($data['eleveId']);
        if (!$eleve) {
            return $this->json(['message' => 'Élève introuvable.'], 404);
        }

        $absence = new Absence();
        $absence->setEleve($eleve)
            ->setDate(new \DateTime($data['date']))
            ->setMotif($data['motif'] ?? null)
            ->setJustifiee($data['justifiee'] ?? false)
            ->setSaisiePar($this->getUser())
            ->setCreatedAt(new \DateTimeImmutable());

        if (isset($data['heureDebut'])) {
            $absence->setHeureDebut(new \DateTime($data['heureDebut']));
        }
        if (isset($data['heureFin'])) {
            $absence->setHeureFin(new \DateTime($data['heureFin']));
        }

        $this->absenceRepository->save($absence, true);

        return $this->json($this->formatAbsence($absence), 201);
    }

    #[Route('/{id}/justifier', name: 'absences_justifier', methods: ['PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function justifier(int $id, Request $request): JsonResponse
    {
        $absence = $this->absenceRepository->find($id);
        if (!$absence) {
            return $this->json(['message' => 'Absence introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // Gestion statut justification (admin)
        if (isset($data['statut'])) {
            $absence->setStatutJustification($data['statut']);
            if ($data['statut'] === 'acceptee') {
                $absence->setJustifiee(true);
            }
        } else {
            $absence->setJustifiee($data['justifiee'] ?? true);
            if (isset($data['motif'])) $absence->setMotif($data['motif']);
        }

        $this->absenceRepository->save($absence, true);

        return $this->json($this->formatAbsence($absence));
    }

    #[Route('/{id}', name: 'absences_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $absence = $this->absenceRepository->find($id);
        if (!$absence) {
            return $this->json(['message' => 'Absence introuvable.'], 404);
        }

        $this->absenceRepository->remove($absence, true);
        return $this->json(['message' => 'Absence supprimée.']);
    }

    private function formatAbsence(Absence $absence): array
    {
        return [
            'id' => $absence->getId(),
            'date' => $absence->getDate()?->format('Y-m-d'),
            'heureDebut' => $absence->getHeureDebut()?->format('H:i'),
            'heureFin' => $absence->getHeureFin()?->format('H:i'),
            'motif' => $absence->getMotif(),
            'justifiee' => $absence->isJustifiee(),
                'statutJustification' => $absence->getStatutJustification(),
                'motifJustification' => $absence->getMotifJustification(),
                'typeJustification' => $absence->getTypeJustification(),
            'createdAt' => $absence->getCreatedAt()?->format('Y-m-d'),
            'eleve' => [
                'id' => $absence->getEleve()->getId(),
                'firstName' => $absence->getEleve()->getFirstName(),
                'lastName' => $absence->getEleve()->getLastName(),
            ],
            'saisiePar' => $absence->getSaisiePar() ? [
                'id' => $absence->getSaisiePar()->getId(),
                'firstName' => $absence->getSaisiePar()->getFirstName(),
                'lastName' => $absence->getSaisiePar()->getLastName(),
            ] : null,
        ];
    }

    private function formatAbsences(array $absences): array
    {
        return array_map(fn($a) => $this->formatAbsence($a), $absences);
    }

    #[Route('/{id}/justifier', name: 'absences_justifier_eleve', methods: ['POST'])]
    public function justifierEleve(int $id, Request $request): JsonResponse
    {
        $absence = $this->em->getRepository(Absence::class)->find($id);
        if (!$absence) return $this->json(['message' => 'Absence introuvable'], 404);

        $data = json_decode($request->getContent(), true);
        $absence->setStatutJustification('en_attente');
        $absence->setMotifJustification($data['motif'] ?? null);
        $absence->setTypeJustification($data['type'] ?? null);
        $this->em->flush();

        return $this->json(['statut' => 'en_attente']);
    }
}