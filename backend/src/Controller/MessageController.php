<?php
namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/conversations')]
#[IsGranted('ROLE_USER')]
class MessageController extends AbstractController
{
    // Liste des conversations
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $convs = $em->getRepository(Conversation::class)->createQueryBuilder('c')
            ->where('c.participant1 = :u OR c.participant2 = :u')
            ->setParameter('u', $user)
            ->orderBy('c.lastMessageAt', 'DESC')
            ->getQuery()->getResult();

        return $this->json(array_map(function($c) use ($user) {
            $other   = $c->getOtherParticipant($user);
            $msgs    = $c->getMessages();
            $last    = $msgs->last();
            $unread  = $msgs->filter(fn($m) => !$m->isRead() && $m->getSender()?->getId() !== $user->getId())->count();
            return [
                'id'          => $c->getId(),
                'other'       => ['id'=>$other?->getId(),'firstName'=>$other?->getFirstName(),'lastName'=>$other?->getLastName(),'roles'=>$other?->getRoles()],
                'lastMessage' => $last ? ['content'=>$last->getContent(),'createdAt'=>$last->getCreatedAt()->format('H:i'),'isMe'=>$last->getSender()?->getId()===$user->getId()] : null,
                'unreadCount' => $unread,
            ];
        }, $convs));
    }

    // Créer ou récupérer une conversation
    #[Route('', methods:['POST'])]
    public function create(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data      = json_decode($req->getContent(), true);
        $user      = $this->getUser();
        $other     = $em->getRepository(User::class)->find($data['userId'] ?? 0);
        if (!$other) return $this->json(['error' => 'Utilisateur non trouvé'], 404);

        // Chercher une conversation existante
        $existing = $em->getRepository(Conversation::class)->createQueryBuilder('c')
            ->where('(c.participant1 = :u AND c.participant2 = :o) OR (c.participant1 = :o AND c.participant2 = :u)')
            ->setParameter('u', $user)->setParameter('o', $other)
            ->getQuery()->getOneOrNullResult();

        if ($existing) return $this->json(['id' => $existing->getId()]);

        $conv = new Conversation();
        $conv->setParticipant1($user);
        $conv->setParticipant2($other);
        $em->persist($conv);
        $em->flush();

        return $this->json(['id' => $conv->getId()], 201);
    }

    // Messages d'une conversation
    #[Route('/{id}/messages', methods:['GET'])]
    public function messages(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $conv = $em->getRepository(Conversation::class)->find($id);
        if (!$conv) return $this->json(['error' => 'Non trouvée'], 404);

        // Marquer comme lus
        foreach ($conv->getMessages() as $msg) {
            if (!$msg->isRead() && $msg->getSender()?->getId() !== $user->getId()) {
                $msg->setIsRead(true);
            }
        }
        $em->flush();

        return $this->json(array_map(fn($m) => [
            'id'        => $m->getId(),
            'content'   => $m->getContent(),
            'isMe'      => $m->getSender()?->getId() === $user->getId(),
            'sender'    => ['id'=>$m->getSender()?->getId(),'firstName'=>$m->getSender()?->getFirstName()],
            'createdAt' => $m->getCreatedAt()->format('H:i'),
            'isRead'    => $m->isRead(),
        ], $conv->getMessages()->toArray()));
    }

    // Envoyer un message
    #[Route('/{id}/messages', methods:['POST'])]
    public function send(int $id, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $conv = $em->getRepository(Conversation::class)->find($id);
        if (!$conv) return $this->json(['error' => 'Non trouvée'], 404);

        $data = json_decode($req->getContent(), true);
        if (empty($data['content'])) return $this->json(['error' => 'Message vide'], 400);

        $msg = new Message();
        $msg->setConversation($conv);
        $msg->setSender($user);
        $msg->setContent($data['content']);
        $conv->setLastMessageAt(new \DateTimeImmutable());

        $em->persist($msg);
        $em->flush();

        return $this->json([
            'id'        => $msg->getId(),
            'content'   => $msg->getContent(),
            'isMe'      => true,
            'createdAt' => $msg->getCreatedAt()->format('H:i'),
            'isRead'    => false,
        ], 201);
    }

    // Liste des utilisateurs avec qui on peut discuter
    #[Route('/users', methods:['GET'])]
    public function users(EntityManagerInterface $em): JsonResponse
    {
        $user  = $this->getUser();
        $etab = $user->getEtablissement();
        $qb = $em->getRepository(User::class)->createQueryBuilder('u')
            ->where('u != :me')
            ->setParameter('me', $user);
        if ($etab) {
            $qb->andWhere('u.etablissement = :etab')->setParameter('etab', $etab);
        }
        $users = $qb->orderBy('u.firstName', 'ASC')->getQuery()->getResult();

        return $this->json(array_map(fn($u) => [
            'id'        => $u->getId(),
            'firstName' => $u->getFirstName(),
            'lastName'  => $u->getLastName(),
            'roles'     => $u->getRoles(),
        ], $users));
    }
}
