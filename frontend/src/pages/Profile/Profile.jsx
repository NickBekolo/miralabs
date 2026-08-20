import { useState } from 'react';
import {
  BadgeCheck,
  Users,
  Settings,
  Plus,
  School,
  GraduationCap,
  BookOpen,
  Puzzle,
  Globe,
  Sparkles,
  Award,
  Star,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import './Profile.css';

const PROFILE_CHIPS = [
  { icon: School, label: 'Établissement', filled: false },
  { icon: GraduationCap, label: 'Classe', filled: false },
  { icon: BookOpen, label: 'Filière', filled: false, alert: true },
  { icon: Puzzle, label: 'Plus d’infos (4/5)', filled: true },
  { icon: Globe, label: 'Centres d’intérêt (4/5)', filled: true },
];

const PHOTOS = [
  '/avatars/photo-1.jpg',
  '/avatars/photo-2.jpg',
  '/avatars/photo-3.jpg',
];

const STATS = [
  { icon: Star, label: 'Badges', value: 0, color: '#2563eb' },
  { icon: Trophy, label: 'Certificats', value: 0, color: '#f59e0b' },
  { icon: Award, label: 'Classement', value: '—', color: '#dc2626' },
];

export default function Profile() {
  const [profileComplete] = useState(false);

  return (
    <div className="profile-page">
      <Navbar onLogout={() => {}} />

      <main className="profile">
        <header className="profile__header">
          <div className="profile__avatar">
            <img src="/avatars/photo-1.jpg" alt="Photo de profil" />
          </div>
          <div className="profile__identity">
            <div className="profile__name-row">
              <h1>Nick</h1>
              <BadgeCheck size={22} strokeWidth={2} className="profile__verified" />
            </div>
            <a href="#" className="profile__preview-link">
              Aperçu <ChevronRight size={16} strokeWidth={2.5} />
            </a>
          </div>
          <div className="profile__header-actions">
            <button type="button" className="profile__icon-btn" aria-label="Contacts">
              <Users size={20} strokeWidth={1.75} />
            </button>
            <button type="button" className="profile__icon-btn" aria-label="Paramètres">
              <Settings size={20} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {!profileComplete && (
          <div className="profile__banner">
            <span className="profile__banner-dot" aria-hidden="true">!</span>
            Complétez votre profil
          </div>
        )}

        <div className="profile__chips">
          {PROFILE_CHIPS.map(({ icon: Icon, label, filled, alert }) => (
            <button
              key={label}
              type="button"
              className={`profile-chip${filled ? ' profile-chip--filled' : ''}`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
              {alert ? (
                <span className="profile-chip__alert" aria-hidden="true" />
              ) : (
                !filled && <Plus size={16} strokeWidth={2} />
              )}
            </button>
          ))}
        </div>

        <section className="profile-section">
          <h2>Mes photos</h2>
          <div className="profile-photos">
            {PHOTOS.map((src, i) => (
              <div key={src} className="profile-photos__item">
                <img src={src} alt={`Photo ${i + 1}`} />
              </div>
            ))}
            <button type="button" className="profile-photos__add" aria-label="Ajouter une photo">
              <Plus size={26} strokeWidth={1.75} />
            </button>
            <button type="button" className="profile-photos__add" aria-label="Ajouter une photo">
              <Plus size={26} strokeWidth={1.75} />
            </button>
          </div>
          <div className="profile-photos__footer">
            <p>Ajoute des photos pour compléter ton profil.</p>
            <button type="button" className="profile-btn profile-btn--dark">
              Modifier
            </button>
          </div>
        </section>

        <section className="profile-section">
          <h2>Mes informations</h2>
          <div className="profile-facts">
            <div className="profile-fact-card">
              <span className="profile-fact-card__label">Bio</span>
              <p className="profile-fact-card__text">
                Ajoute une courte présentation pour que ton établissement et tes camarades
                te connaissent mieux.
              </p>
            </div>
            <div className="profile-fact-card">
              <span className="profile-fact-card__label">Ce qui me motive</span>
              <p className="profile-fact-card__text">
                Partage tes objectifs de l'année ou ta matière préférée.
              </p>
            </div>
          </div>
        </section>

        <div className="profile-promo">
          <div className="profile-promo__text">
            <Sparkles size={22} strokeWidth={2} />
            <div>
              <strong>MiraIA</strong>
              <span>Ton assistant pédagogique intelligent</span>
            </div>
          </div>
          <ChevronRight size={22} strokeWidth={2.5} />
        </div>

        <div className="profile-stats">
          {STATS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="profile-stat">
              <Icon size={18} strokeWidth={2} color={color} fill={color} />
              <span>
                {value} {label}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
