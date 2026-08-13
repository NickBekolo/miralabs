import { User } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = ['Pédagogie', 'Notes', 'Actualités', 'Mon assiduité'];

export default function Navbar({ onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <svg
          className="navbar__logo"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="3" fill="currentColor" />
          <circle cx="18" cy="6" r="3" fill="currentColor" />
          <circle cx="6" cy="18" r="3" fill="currentColor" />
          <circle cx="18" cy="18" r="3" fill="currentColor" />
          <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="navbar__title">Education.</span>
      </div>

      <nav className="navbar__links">
        {NAV_LINKS.map((label) => (
          <a key={label} href="#" className="navbar__link">
            {label}
          </a>
        ))}
      </nav>

      <div className="navbar__actions">
        <button type="button" className="navbar__icon-btn" aria-label="Profil">
          <User size={22} strokeWidth={1.75} />
        </button>
        <button type="button" className="navbar__logout" onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
