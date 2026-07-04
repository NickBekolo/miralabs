<?php

namespace App\Controller;

use App\Entity\EventLog;
use App\Repository\EventLogRepository;
use App\Repository\UserRepository;
use App\Repository\EtablissementRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/platform/analytics')]
class AnalyticsController extends AbstractController
{
    public function __construct(
        private EventLogRepository     $eventLogRepo,
        private UserRepository         $userRepo,
        private EtablissementRepository $etablissementRepo,
    ) {}

    /**
     * Vue d'ensemble globale de la plateforme
     */
    #[Route('/overview', name: 'analytics_overview', methods: ['GET'])]
    public function overview(): JsonResponse
    {
        $users  = $this->userRepo->findAll();
        $etabs  = $this->etablissementRepo->findAll();

        $roles = [
            'students'  => 0,
            'teachers'  => 0,
            'parents'   => 0,
            'admins'    => 0,
        ];

        foreach ($users as $u) {
            if (in_array('ROLE_STUDENT', $u->getRoles()))              $roles['students']++;
            elseif (in_array('ROLE_TEACHER', $u->getRoles()))         $roles['teachers']++;
            elseif (in_array('ROLE_PARENT', $u->getRoles()))          $roles['parents']++;
            elseif (in_array('ROLE_SUPER_ADMIN', $u->getRoles()))     $roles['admins']++;
        }

        // Connexions aujourd'hui
        $today       = new \DateTimeImmutable('today');
        $loginsToday = $this->eventLogRepo->countByTypeAndDate(EventLog::LOGIN, $today);

        // Connexions cette semaine
        $weekStart   = new \DateTimeImmutable('monday this week');
        $loginsWeek  = $this->eventLogRepo->countByTypeAndDate(EventLog::LOGIN, $weekStart);

        return $this->json([
            'etablissements' => [
                'total'   => count($etabs),
                'actifs'  => count(array_filter($etabs, fn($e) => $e->isActive())),
                'inactifs'=> count(array_filter($etabs, fn($e) => !$e->isActive())),
            ],
            'users' => [
                'total'    => count($users),
                'students' => $roles['students'],
                'teachers' => $roles['teachers'],
                'parents'  => $roles['parents'],
                'admins'   => $roles['admins'],
            ],
            'activity' => [
                'loginsToday' => $loginsToday,
                'loginsWeek'  => $loginsWeek,
            ],
        ]);
    }

    /**
     * Courbe de croissance des utilisateurs (30 derniers jours)
     */
    #[Route('/users-growth', name: 'analytics_users_growth', methods: ['GET'])]
    public function usersGrowth(): JsonResponse
    {
        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date  = new \DateTimeImmutable("-$i days");
            $label = $date->format('d/m');

            // Nb de comptes créés jusqu'à cette date
            $count = $this->userRepo->countCreatedBefore($date);
            $data[] = ['date' => $label, 'total' => $count];
        }

        return $this->json($data);
    }

    /**
     * Pic de connexions par heure sur les 7 derniers jours
     */
    #[Route('/peak-hours', name: 'analytics_peak_hours', methods: ['GET'])]
    public function peakHours(): JsonResponse
    {
        $since = new \DateTimeImmutable('-7 days');
        $data  = $this->eventLogRepo->getLoginsByHour($since);

        // Formate pour le graphique (0h → 23h)
        $hours = array_fill(0, 24, 0);
        foreach ($data as $row) {
            $hours[(int)$row['hour']] = (int)$row['count'];
        }

        $result = [];
        for ($h = 0; $h < 24; $h++) {
            $result[] = ['hour' => $h . 'h', 'connexions' => $hours[$h]];
        }

        return $this->json($result);
    }

    /**
     * Fréquentation quotidienne des 30 derniers jours
     */
    #[Route('/daily-activity', name: 'analytics_daily_activity', methods: ['GET'])]
    public function dailyActivity(): JsonResponse
    {
        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date  = new \DateTimeImmutable("-$i days");
            $label = $date->format('d/m');
            $count = $this->eventLogRepo->countByTypeAndDate(EventLog::LOGIN, $date);
            $data[] = ['date' => $label, 'connexions' => $count];
        }

        return $this->json($data);
    }

    /**
     * Stats par établissement (chiffres seulement, pas le contenu)
     */
    #[Route('/by-etablissement', name: 'analytics_by_etab', methods: ['GET'])]
    public function byEtablissement(): JsonResponse
    {
        $etabs = $this->etablissementRepo->findAll();
        $data  = [];

        foreach ($etabs as $etab) {
            $users    = $this->userRepo->findBy(['etablissement' => $etab]);
            $students = array_filter($users, fn($u) => in_array('ROLE_STUDENT', $u->getRoles()));
            $teachers = array_filter($users, fn($u) => in_array('ROLE_TEACHER', $u->getRoles()));

            $since    = new \DateTimeImmutable('-30 days');
            $logins   = $this->eventLogRepo->countByEtabAndType($etab, EventLog::LOGIN, $since);

            $data[] = [
                'id'         => $etab->getId(),
                'name'       => $etab->getName(),
                'code'       => $etab->getCode(),
                'type'       => $etab->getType(),
                'isActive'   => $etab->isActive(),
                'nbUsers'    => count($users),
                'nbStudents' => count($students),
                'nbTeachers' => count($teachers),
                'loginsLast30days' => $logins,
                'engagementScore'  => $this->computeEngagement($logins, count($students)),
            ];
        }

        // Tri par score d'engagement décroissant
        usort($data, fn($a, $b) => $b['engagementScore'] <=> $a['engagementScore']);

        return $this->json($data);
    }

    private function computeEngagement(int $logins, int $students): int
    {
        if ($students === 0) return 0;
        return min(100, (int)(($logins / ($students * 30)) * 100));
    }
}