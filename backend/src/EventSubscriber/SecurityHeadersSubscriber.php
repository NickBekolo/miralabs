<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Ajoute les en-têtes de sécurité HTTP sur chaque réponse de l'API.
 *
 * Ces en-têtes constituent une défense en profondeur contre plusieurs
 * vecteurs d'attaque : clickjacking, sniffing de type MIME, etc.
 *
 * Références : OWASP Secure Headers Project
 * https://owasp.org/www-project-secure-headers/
 */
class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        // Ne traiter que la requête principale (pas les sous-requêtes)
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();

        // Empêche le clickjacking (inclusion dans une iframe)
        $response->headers->set('X-Frame-Options', 'DENY');

        // Désactive le sniffing de type MIME par le navigateur
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Active la protection XSS intégrée des anciens navigateurs
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Force HTTPS en production (HSTS — désactivé en dev pour éviter les problèmes)
        // En production (Railway), le TLS est assuré au niveau de la plateforme
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restreint les fonctionnalités du navigateur (géolocalisation, caméra, etc.)
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Content Security Policy pour l'API (les réponses sont du JSON, pas du HTML)
        // default-src none = refuse toute ressource chargeable
        $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

        // Supprime l'en-tête X-Powered-By qui révèle la version de PHP
        $response->headers->remove('X-Powered-By');
    }
}
