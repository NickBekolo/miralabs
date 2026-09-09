<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class StaticController extends AbstractController
{
    #[Route('/signatures/{filename}', name: 'static_signature', requirements: ['filename' => '.+'])]
    public function signature(string $filename): Response
    {
        $path = __DIR__.'/../../public/signatures/'.$filename;
        if (!file_exists($path)) {
            return new Response('Not found', 404);
        }
        return new BinaryFileResponse($path);
    }
}
