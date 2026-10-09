<?php

namespace App\Service;

use Psr\Cache\CacheItemPoolInterface;

/**
 * Service de protection contre les attaques par brute force.
 *
 * Utilise le cache Symfony pour enregistrer les tentatives de connexion
 * échouées par adresse IP et bloquer temporairement les IP suspectes.
 *
 * Politique :
 *  - 5 tentatives échouées → blocage de 15 minutes
 *  - Le compteur se réinitialise après un login réussi
 *  - Clé de cache : login_attempt_{ip_hash}
 */
class LoginAttemptService
{
    private const MAX_ATTEMPTS   = 5;
    private const LOCKOUT_TTL    = 900; // 15 minutes en secondes
    private const CACHE_PREFIX   = 'login_attempt_';

    public function __construct(
        private readonly CacheItemPoolInterface $cache,
    ) {}

    /**
     * Vérifie si l'IP est actuellement bloquée.
     */
    public function isBlocked(string $ip): bool
    {
        $item = $this->cache->getItem($this->buildKey($ip));

        if (!$item->isHit()) {
            return false;
        }

        $data = $item->get();

        return isset($data['blocked']) && $data['blocked'] === true;
    }

    /**
     * Retourne le nombre de secondes restantes avant déblocage (0 si non bloqué).
     */
    public function getSecondsUntilUnlock(string $ip): int
    {
        $item = $this->cache->getItem($this->buildKey($ip));

        if (!$item->isHit()) {
            return 0;
        }

        $data = $item->get();

        if (!isset($data['blocked_at'])) {
            return 0;
        }

        $elapsed   = time() - $data['blocked_at'];
        $remaining = self::LOCKOUT_TTL - $elapsed;

        return max(0, $remaining);
    }

    /**
     * Enregistre une tentative de connexion échouée.
     * Bloque l'IP si le nombre maximum de tentatives est atteint.
     */
    public function recordFailure(string $ip): void
    {
        $key  = $this->buildKey($ip);
        $item = $this->cache->getItem($key);

        $data = $item->isHit() ? $item->get() : ['attempts' => 0, 'blocked' => false];

        $data['attempts']++;

        if ($data['attempts'] >= self::MAX_ATTEMPTS) {
            $data['blocked']    = true;
            $data['blocked_at'] = time();
        }

        $item->set($data);
        $item->expiresAfter(self::LOCKOUT_TTL);

        $this->cache->save($item);
    }

    /**
     * Réinitialise le compteur après un login réussi.
     */
    public function resetAttempts(string $ip): void
    {
        $this->cache->deleteItem($this->buildKey($ip));
    }

    /**
     * Retourne le nombre de tentatives échouées restantes avant blocage.
     */
    public function getRemainingAttempts(string $ip): int
    {
        $item = $this->cache->getItem($this->buildKey($ip));

        if (!$item->isHit()) {
            return self::MAX_ATTEMPTS;
        }

        $data = $item->get();

        return max(0, self::MAX_ATTEMPTS - ($data['attempts'] ?? 0));
    }

    /**
     * Génère une clé de cache à partir de l'IP (hashée pour ne pas stocker l'IP en clair).
     */
    private function buildKey(string $ip): string
    {
        return self::CACHE_PREFIX . hash('sha256', $ip);
    }
}
