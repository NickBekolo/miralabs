<?php
namespace App\Controller;

use App\Entity\DemandeModification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/demandes')]
class DemandeModificationController extends AbstractController
{
    // Créer une demande
    #[Route('', methods: ['POST'])]
    public function create(Request $req, EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($req->getContent(), true);

        $demande = new DemandeModification();
        $demande->setDemandeur($user);
        $demande->setChamp($data['champ'] ?? '');
        $demande->setNouvelleValeur($data['nouvelleValeur'] ?? '');
        $demande->setMessage($data['message'] ?? null);
        $demande->setEtablissement($user->getEtablissement());

        $em->persist($demande);
        $em->flush();

        return $this->json(['message' => 'Demande envoyée.', 'id' => $demande->getId()], 201);
    }

    // Lister les demandes (SuperAdmin)
    #[Route('', methods: ['GET'])]
    public function list(EntityManagerInterface $em, #[CurrentUser] User $admin): JsonResponse
    {
        $demandes = $em->getRepository(DemandeModification::class)->findBy(
            ['etablissement' => $admin->getEtablissement()],
            ['createdAt' => 'DESC']
        );

        return $this->json(array_map(fn($d) => [
            'id'             => $d->getId(),
            'demandeur'      => $d->getDemandeur()?->getFirstName().' '.$d->getDemandeur()?->getLastName(),
            'demandeurId'    => $d->getDemandeur()?->getId(),
            'champ'          => $d->getChamp(),
            'nouvelleValeur' => $d->getNouvelleValeur(),
            'message'        => $d->getMessage(),
            'statut'         => $d->getStatut(),
            'createdAt'      => $d->getCreatedAt()->format('d/m/Y H:i'),
            'traitePar'      => $d->getTraitePar()?->getFirstName().' '.$d->getTraitePar()?->getLastName(),
            'traiteAt'       => $d->getTraiteAt()?->format('d/m/Y H:i'),
            'commentaire'      => $d->getCommentaireAdmin(),
            'justificatifPath' => $d->getJustificatifPath(),
        ], $demandes));
    }

    // Approuver ou rejeter
    #[Route('/{id}/traiter', methods: ['POST'])]
    public function traiter(int $id, Request $req, EntityManagerInterface $em, #[CurrentUser] User $admin): JsonResponse
    {
        $demande = $em->getRepository(DemandeModification::class)->find($id);
        if (!$demande) return $this->json(['message' => 'Demande introuvable.'], 404);

        $data = json_decode($req->getContent(), true);
        $action = $data['action'] ?? ''; // approuver | rejeter
        $commentaire = $data['commentaire'] ?? null;

        $demande->setStatut($action === 'approuver' ? 'approuvee' : 'rejetee');
        $demande->setTraitePar($admin);
        $demande->setTraiteAt(new \DateTimeImmutable());
        $demande->setCommentaireAdmin($commentaire);

        // Si approuvée → appliquer la modification
        if ($action === 'approuver') {
            $user = $demande->getDemandeur();
            match($demande->getChamp()) {
                'Modifier mon nom / prénom'         => $user->setFirstName(explode(' ', $demande->getNouvelleValeur())[0] ?? $user->getFirstName()),
                'Modifier ma date de naissance'     => $user->setDateNaissance(new \DateTime($demande->getNouvelleValeur())),
                'Modifier mon email'                => $user->setEmail($demande->getNouvelleValeur()),
                'Modifier mon numéro de téléphone'  => $user->setTelephone($demande->getNouvelleValeur()),
                default => null
            };
            $em->persist($user);
        }

        $em->flush();
        return $this->json(['message' => $action === 'approuver' ? 'Demande approuvée et modification appliquée.' : 'Demande rejetée.']);
    }

    // Mes demandes
    #[Route('/mes-demandes', methods: ['GET'])]
    public function mesDemandes(EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $demandes = $em->getRepository(DemandeModification::class)->findBy(
            ['demandeur' => $user],
            ['createdAt' => 'DESC']
        );

        return $this->json(array_map(fn($d) => [
            'id'             => $d->getId(),
            'champ'          => $d->getChamp(),
            'nouvelleValeur' => $d->getNouvelleValeur(),
            'statut'         => $d->getStatut(),
            'createdAt'      => $d->getCreatedAt()->format('d/m/Y H:i'),
            'commentaire'    => $d->getCommentaireAdmin(),
            'traiteAt'       => $d->getTraiteAt()?->format('d/m/Y H:i'),
        ], $demandes));
    }
}
