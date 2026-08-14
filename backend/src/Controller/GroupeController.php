<?php
namespace App\Controller;

use App\Entity\Groupe;
use App\Entity\GroupeMessage;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/groupes')]
#[IsGranted('ROLE_USER')]
class GroupeController extends AbstractController
{
    // Liste des groupes de l'utilisateur
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $groupes = $em->getRepository(Groupe::class)->createQueryBuilder('g')
            ->join('g.membres', 'm')
            ->where('m = :user')
            ->setParameter('user', $user)
            ->orderBy('g.lastMessageAt', 'DESC')
            ->addOrderBy('g.id', 'DESC')
            ->getQuery()->getResult();

        return $this->json(array_map(fn($g) => [
            'id'            => $g->getId(),
            'nom'           => $g->getNom(),
            'couleur'       => $g->getCouleur(),
            'nbMembres'     => $g->getMembres()->count(),
            'unread'        => $g->getMessages()->filter(fn($m) => !$m->getSender() || $m->getSender()->getId() !== $user->getId())->count() > 0 ? 1 : 0,
            'lastMessage'   => $g->getMessages()->last() ? [
                'content'   => $g->getMessages()->last()->getContent(),
                'createdAt' => $g->getMessages()->last()->getCreatedAt()->format('H:i'),
                'datetime'  => $g->getMessages()->last()->getCreatedAt()->format('Y-m-d H:i:s'),
                'isMe'      => $g->getMessages()->last()->getSender()?->getId() === $user->getId(),
            ] : null,
        ], $groupes));
    }

    // Créer un groupe
    #[Route('', methods:['POST'])]
    public function create(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data   = json_decode($req->getContent(), true);
        $user   = $this->getUser();
        $groupe = new Groupe();
        $groupe->setNom($data['nom'] ?? 'Nouveau groupe');
        $groupe->setCouleur($data['couleur'] ?? '#007AFF');
        $groupe->setCreateur($user);
        $groupe->setEtablissement($user->getEtablissement());
        $groupe->addMembre($user);

        foreach ($data['membresIds'] ?? [] as $id) {
            $membre = $em->getRepository(User::class)->find($id);
            if ($membre) $groupe->addMembre($membre);
        }

        $em->persist($groupe);
        $em->flush();
        return $this->json(['id' => $groupe->getId(), 'nom' => $groupe->getNom()], 201);
    }

    // Messages d'un groupe
    #[Route('/{id}/messages', methods:['GET'])]
    public function messages(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user   = $this->getUser();
        $groupe = $em->getRepository(Groupe::class)->find($id);
        if (!$groupe) return $this->json(['error' => 'Non trouvé'], 404);

        return $this->json(array_map(fn($m) => [
            'id'        => $m->getId(),
            'content'   => $m->getContent(),
            'isMe'      => $m->getSender()?->getId() === $user->getId(),
            'sender'    => ['id'=>$m->getSender()?->getId(),'firstName'=>$m->getSender()?->getFirstName(),'lastName'=>$m->getSender()?->getLastName()],
            'createdAt' => $m->getCreatedAt()->format('H:i'),
            'replyTo'   => $m->getReplyToId() ? ['id'=>$m->getReplyToId(),'text'=>$m->getReplyToText()] : null,
        ], $groupe->getMessages()->toArray()));
    }

    // Envoyer un message dans un groupe
    #[Route('/{id}/messages', methods:['POST'])]
    public function send(int $id, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $user   = $this->getUser();
        $groupe = $em->getRepository(Groupe::class)->find($id);
        if (!$groupe) return $this->json(['error' => 'Non trouvé'], 404);

        $data = json_decode($req->getContent(), true);
        if (empty($data['content'])) return $this->json(['error' => 'Message vide'], 400);

        $msg = new GroupeMessage();
        $msg->setGroupe($groupe);
        $msg->setSender($user);
        $msg->setContent($data['content']);
        if (!empty($data['replyToId'])) $msg->setReplyToId((int)$data['replyToId']);
        if (!empty($data['replyToText'])) $msg->setReplyToText($data['replyToText']);
        $groupe->setLastMessageAt(new \DateTimeImmutable());

        $em->persist($msg);
        $this->notifyMembres($groupe, $user, $em);
        $em->flush();

        return $this->json([
            'id'        => $msg->getId(),
            'content'   => $msg->getContent(),
            'isMe'      => true,
            'sender'    => ['id'=>$user->getId(),'firstName'=>$user->getFirstName(),'lastName'=>$user->getLastName()],
            'createdAt' => $msg->getCreatedAt()->format('H:i'),
        ], 201);
    }

    // Membres d'un groupe
    #[Route('/{id}/membres', methods:['GET'])]
    public function membres(int $id, EntityManagerInterface $em): JsonResponse
    {
        $groupe = $em->getRepository(Groupe::class)->find($id);
        if (!$groupe) return $this->json(['error' => 'Non trouvé'], 404);
        return $this->json(array_map(fn($m) => [
            'id'=>$m->getId(),'firstName'=>$m->getFirstName(),'lastName'=>$m->getLastName(),'roles'=>$m->getRoles()
        ], $groupe->getMembres()->toArray()));
    }

    private function notifyMembres(Groupe $groupe, User $sender, EntityManagerInterface $em): void
    {
        foreach ($groupe->getMembres() as $membre) {
            if ($membre->getId() === $sender->getId()) continue;
            $notif = new \App\Entity\Notification();
            $notif->setTitle($groupe->getNom());
            $notif->setMessage($sender->getFirstName().' a envoyé un message dans '.$groupe->getNom());
            $notif->setType('groupe');
            $notif->setSender($sender);
            $notif->setRecipient($membre);
            $notif->setIsRead(false);
            $notif->setCreateAt(new \DateTimeImmutable());
            $em->persist($notif);
        }
    }
}