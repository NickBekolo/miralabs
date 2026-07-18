<?php

namespace App\Controller;

use App\Entity\Document;
use App\Repository\DocumentRepository;
use App\Repository\MatiereRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\User;

#[Route('/api/documents')]
class DocumentController extends AbstractController
{
    use EtablissementTrait;
    public function __construct(
        private DocumentRepository $documentRepo,
        private MatiereRepository  $matiereRepo,
        private EntityManagerInterface $em,
    ) {}

    private function serialize(Document $d): array
    {
        return [
            'id'        => $d->getId(),
            'titre'     => $d->getTitre(),
            'fichier'   => $d->getFichier(),
            'type'      => $d->getType(),
            'couleur'   => $d->getCouleur(),
            'createdAt' => $d->getCreatedAt()?->format('d/m/Y'),
            'matiere'   => $d->getMatiere() ? [
                'id'  => $d->getMatiere()->getId(),
                'nom' => $d->getMatiere()->getNom(),
            ] : null,
            'uploader' => $d->getUploader() ? [
                'id'        => $d->getUploader()->getId(),
                'firstName' => $d->getUploader()->getFirstName(),
                'lastName'  => $d->getUploader()->getLastName(),
            ] : null,
        ];
    }

    /**
     * Liste tous les documents
     */
    #[Route('', name: 'documents_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $docs = $this->documentRepo->findBy([], ['createdAt' => 'DESC']);
        return $this->json(array_map([$this, 'serialize'], $docs));
    }

    /**
     * Upload un document
     */
    #[Route('', name: 'documents_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $titre    = $request->request->get('titre');
        $couleur  = $request->request->get('couleur', '#1e3a5f');
        $matiereId = $request->request->get('matiereId');

        /** @var UploadedFile|null $file */
        $file = $request->files->get('fichier');

        if (!$titre) {
            return $this->json(['message' => 'Le titre est requis.'], 400);
        }

        $doc = new Document();
        $doc->setTitre($titre);
        $doc->setCouleur($couleur);
        $doc->setCreatedAt(new \DateTimeImmutable());
        $doc->setUploader($user);

        if ($file) {
            $extension = $file->getClientOriginalExtension();
            $newName   = uniqid() . '.' . $extension;
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/documents';

            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            $file->move($uploadDir, $newName);
            $doc->setFichier($newName);
            $doc->setType(strtolower($extension));
        } else {
            $doc->setFichier('');
            $doc->setType('pdf');
        }

        if ($matiereId) {
            $matiere = $this->matiereRepo->find($matiereId);
            if ($matiere) $doc->setMatiere($matiere);
        }

        $this->em->persist($doc);
        $this->em->flush();

        return $this->json($this->serialize($doc), 201);
    }

    /**
     * Supprimer un document
     */
    #[Route('/{id}', name: 'documents_delete', methods: ['DELETE'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $doc = $this->documentRepo->find($id);
        if (!$doc) {
            return $this->json(['message' => 'Document introuvable.'], 404);
        }

        // Supprimer le fichier physique
        $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/documents/' . $doc->getFichier();
        if (file_exists($filePath)) unlink($filePath);

        $this->em->remove($doc);
        $this->em->flush();

        return $this->json(['message' => 'Document supprimé.']);
    }
}