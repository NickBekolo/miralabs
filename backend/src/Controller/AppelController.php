<?php
namespace App\Controller;

use App\Entity\Appel;
use App\Entity\Absence;
use App\Entity\Cours;
use App\Entity\Notification;
use App\Entity\Presence;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/appels')]
class AppelController extends AbstractController
{
    #[Route('/en-cours', methods:['GET'])]
    #[IsGranted('ROLE_USER')]
    public function enCours(EntityManagerInterface $em): JsonResponse
    {
        $eleve  = $this->getUser();
        $appels = $em->getRepository(Appel::class)->findBy(['statut' => 'en_cours']);
        $result = [];
        foreach ($appels as $appel) {
            foreach ($appel->getPresences() as $presence) {
                if ($presence->getEleve()->getId() === $eleve->getId()
                    && !$presence->isSigned()
                    && $presence->getStatut() !== 'absent') {
                    $result[] = [
                        'id'            => $appel->getId(),
                        'codeSignature' => $appel->getCodeSignature(),
                        'enseignant'    => $appel->getEnseignant()->getFirstName().' '.$appel->getEnseignant()->getLastName(),
                        'dateHeure'     => $appel->getDateHeure()?->format('H:i'),
                    ];
                }
            }
        }
        return $this->json($result);
    }

    #[Route('/signer', methods:['POST'])]
    #[IsGranted('ROLE_USER')]
    public function signer(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data  = json_decode($req->getContent(), true);
        $code  = strtoupper(trim($data['code'] ?? ''));
        $appel = $em->getRepository(Appel::class)->findOneBy(['codeSignature' => $code, 'statut' => 'en_cours']);
        if (!$appel) return $this->json(['error' => 'Code invalide ou appel terminé'], 400);
        $eleve = $this->getUser();
        foreach ($appel->getPresences() as $presence) {
            if ($presence->getEleve()->getId() === $eleve->getId()) {
                if ($presence->getStatut() === 'absent') {
                    return $this->json(['error' => 'Vous avez été marqué absent par votre professeur'], 403);
                }
                $presence->setSigned(true);
                $presence->setStatut('present');
                // Utiliser signature enregistrée ou nouvelle signature
                $signatureBase64 = $data['signature'] ?? null;
                $signatureUrl    = $eleve->getSignatureUrl();

                if ($signatureBase64) {
                    // Nouvelle signature — enregistrer et mettre à jour le profil
                    $base64 = str_contains($signatureBase64, ',') ? explode(',', $signatureBase64)[1] : $signatureBase64;
                    $imageData = base64_decode($base64);
                    $filename  = 'signature_'.$eleve->getId().'.png';
                    $filepath  = $this->getParameter('kernel.project_dir') . '/public/signatures/' . $filename;
                    if (!is_dir(dirname($filepath))) mkdir(dirname($filepath), 0775, true);
                    file_put_contents($filepath, $imageData);
                    $eleve->setSignatureUrl('/signatures/'.$filename);
                    $presence->setSignatureImage('/signatures/'.$filename);
                } elseif ($signatureUrl) {
                    // Utiliser signature enregistrée
                    $presence->setSignatureImage($signatureUrl);
                }
                // Supprimer la notification d'appel pour cet élève
                $notifRepo = $em->getRepository(\App\Entity\Notification::class);
                $notifAppel = $notifRepo->findOneBy(['recipient' => $eleve, 'type' => 'appel']);
                if ($notifAppel) $em->remove($notifAppel);
                
                $em->flush();
                return $this->json(['message' => 'Émargement signé avec succès ✓']);
            }
        }
        return $this->json(['error' => "Vous n'êtes pas dans cet appel"], 403);
    }

    #[Route('/historique', methods:['GET'])]
    #[IsGranted('ROLE_TEACHER')]
    public function historique(EntityManagerInterface $em): JsonResponse
    {
        $appels = $em->getRepository(Appel::class)->findBy(
            ['enseignant' => $this->getUser()],
            ['id' => 'DESC'],
            20
        );
        return $this->json(array_map(fn($a) => [
            'id'         => $a->getId(),
            'statut'     => $a->getStatut(),
            'dateHeure'  => $a->getDateHeure()?->format('d/m/Y H:i'),
            'nbPresents' => count(array_filter($a->getPresences()->toArray(), fn($p) => $p->getStatut() === 'present')),
            'nbAbsents'  => count(array_filter($a->getPresences()->toArray(), fn($p) => $p->getStatut() === 'absent')),
            'nbSignes'   => count(array_filter($a->getPresences()->toArray(), fn($p) => $p->isSigned())),
        ], $appels));
    }

    #[Route('', methods:['POST'])]
    #[IsGranted('ROLE_TEACHER')]
    public function create(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data  = json_decode($req->getContent(), true);
        $cours = !empty($data['coursId']) ? $em->getRepository(Cours::class)->find($data['coursId']) : null;
        $etab  = $this->getUser()->getEtablissement();
        $signatureActive = $etab ? $etab->isSignatureNumeriqueActive() : true;

        $appel = new Appel();
        $appel->setCours($cours);
        $appel->setEnseignant($this->getUser());

        $absentsIds = $data['absentsIds'] ?? [];
        foreach (($data['eleveIds'] ?? []) as $eleveId) {
            $eleve = $em->getRepository(User::class)->find($eleveId);
            if (!$eleve) continue;
            $presence = new Presence();
            $presence->setAppel($appel);
            $presence->setEleve($eleve);
            if (in_array($eleveId, $absentsIds)) {
                $presence->setStatut('absent');
            } else {
                $presence->setStatut($signatureActive ? 'en_attente' : 'present');
                
            }
            $em->persist($presence);
        }
        $em->persist($appel);
        $em->flush();
        return $this->json(['id' => $appel->getId(), 'codeSignature' => $appel->getCodeSignature(), 'message' => 'Appel lancé'], 201);
    }

    #[Route('/{id}', methods:['GET'], requirements:['id' => '\d+'])]
    #[IsGranted('ROLE_TEACHER')]
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $appel = $em->getRepository(Appel::class)->find($id);
        if (!$appel) return $this->json(['error' => 'Non trouvé'], 404);
        $presences = array_map(fn($p) => [
            'id'             => $p->getId(),
            'eleve'          => ['id'=>$p->getEleve()->getId(),'firstName'=>$p->getEleve()->getFirstName(),'lastName'=>$p->getEleve()->getLastName()],
            'statut'         => $p->getStatut(),
            'signed'         => $p->isSigned(),
            'signedAt'       => $p->getSignedAt() ? (clone $p->getSignedAt())->setTimezone(new \DateTimeZone('Europe/Paris'))->format('H:i') : null,
            'signatureImage' => $p->getSignatureImage(),
        ], $appel->getPresences()->toArray());
        return $this->json(['id'=>$appel->getId(),'statut'=>$appel->getStatut(),'codeSignature'=>$appel->getCodeSignature(),'dateHeure'=>$appel->getDateHeure()?->format('Y-m-d H:i'),'presences'=>$presences]);
    }

    #[Route('/{id}/terminer', methods:['PATCH'], requirements:['id' => '\d+'])]
    #[IsGranted('ROLE_TEACHER')]
    public function terminer(int $id, EntityManagerInterface $em): JsonResponse
    {
        $appel = $em->getRepository(Appel::class)->find($id);
        if (!$appel) return $this->json(['error' => 'Non trouvé'], 404);
        $appel->setStatut('termine');

        // Supprimer les notifications d'appel liées
        $notifs = $em->getRepository(\App\Entity\Notification::class)->findBy(['type' => 'appel']);
        foreach ($notifs as $notif) {
            $em->remove($notif);
        }

        $absencesCreees = 0;
        foreach ($appel->getPresences() as $presence) {
            if ($presence->getStatut() === 'absent' || (!$presence->isSigned() && $presence->getStatut() === 'en_attente')) {
                $absence = new Absence();
                $absence->setEleve($presence->getEleve());
                $absence->setDate(new \DateTime());
                $absence->setMotif($presence->getStatut() === 'absent' ? 'Absent (appel prof)' : 'Non émargé');
                $absence->setIsJustified(false);
                $absence->setCreatedAt(new \DateTimeImmutable());
                if ($this->getUser()->getEtablissement()) $absence->setEtablissement($this->getUser()->getEtablissement());
                $em->persist($absence);
                $absencesCreees++;
                $presence->setStatut('absent');
            }
        }
        // Supprimer les fichiers de signature
        foreach ($appel->getPresences() as $presence) {
            if ($presence->getSignatureImage()) {
                $filepath = $this->getParameter('kernel.project_dir') . '/public' . $presence->getSignatureImage();
                if (file_exists($filepath)) {
                    unlink($filepath);
                }
                $presence->setSignatureImage(null);
            }
        }
        $em->flush();
        return $this->json(['message' => 'Appel terminé', 'absencesCreees' => $absencesCreees]);
    }

    #[Route('/presences/{id}', methods:['PATCH'])]
    #[IsGranted('ROLE_TEACHER')]
    public function updatePresence(int $id, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $presence = $em->getRepository(Presence::class)->find($id);
        if (!$presence) return $this->json(['error' => 'Non trouvée'], 404);
        $data = json_decode($req->getContent(), true);
        $presence->setStatut($data['statut'] ?? $presence->getStatut());
        $em->flush();
        return $this->json(['message' => 'Mis à jour']);
    }
}
