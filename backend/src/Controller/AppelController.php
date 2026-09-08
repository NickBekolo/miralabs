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
        // Fermer automatiquement les appels de plus de 2h
        $vieux = $em->createQuery(
            "UPDATE App\\Entity\\Appel a SET a.statut = 'termine' 
             WHERE a.statut = 'en_cours' AND a.createdAt < :limit"
        )->setParameter('limit', new \DateTime('-2 hours'))->execute();
        
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
                if (!empty($data['signature'])) {
                $base64 = $data['signature'];
                // Extraire les données base64
                if (str_contains($base64, ',')) {
                    $base64 = explode(',', $base64)[1];
                }
                $imageData = base64_decode($base64);
                $filename  = 'sig_' . $presence->getAppel()->getId() . '_' . $eleve->getId() . '_' . time() . '.png';
                $filepath  = $this->getParameter('kernel.project_dir') . '/public/signatures/' . $filename;
                file_put_contents($filepath, $imageData);
                $presence->setSignatureImage('/signatures/' . $filename);
            }
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
                if ($signatureActive) {
                    $notif = new Notification();
                    $notif->setTitle('Signez votre présence');
                    $notif->setMessage("Votre professeur ".$this->getUser()->getFirstName()." ".$this->getUser()->getLastName()." a lancé l'appel. Signez maintenant !");
                    $notif->setType('appel');
                    $notif->setSender($this->getUser());
                    $notif->setRecipient($eleve);
                    $notif->setIsRead(false);
                    $notif->setCreateAt(new \DateTimeImmutable());
                    $em->persist($notif);
                }
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
            'signedAt'       => $p->getSignedAt()?->format('H:i'),
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
