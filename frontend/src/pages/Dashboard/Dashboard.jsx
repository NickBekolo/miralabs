import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import './Dashboard.css';

const SCHEDULE = [
  { id: 1, start: '08:30', end: '09:30', title: 'Mathématiques', room: 'Salle 204' },
  { id: 'pause-1', pause: true, duration: '50 mins' },
  { id: 2, start: '08:30', end: '09:30', title: 'Physique-Chimie', room: 'Salle 108' },
  { id: 3, start: '08:30', end: '09:30', title: 'Anglais', room: 'Salle 305' },
];

const CLASSES = [
  'Terminale A',
  'Terminale B',
  'Première A',
  'Première B',
  'Seconde A',
  'Seconde B',
];

function formatDate(date) {
  const weekday = date
    .toLocaleDateString('fr-FR', { weekday: 'short' })
    .replace('.', '');
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  return {
    weekday: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}.`,
    day: date.getDate(),
    month: `${month.charAt(0).toUpperCase()}${month.slice(1)}.`,
    year: date.getFullYear(),
  };
}

export default function Dashboard() {
  const [selectedDate] = useState(new Date());
  const { weekday, day, month, year } = formatDate(selectedDate);

  return (
    <div className="dashboard">
      <Navbar onLogout={() => {}} />

      <main className="dashboard__content">
        <section className="panel schedule-panel">
          <div className="schedule-panel__header">
            <h1 className="panel__title">Emploi du temps</h1>

            <div className="schedule-panel__date">
              <div className="schedule-panel__date-row">
                <span>{weekday}</span>
                <span className="schedule-panel__day-badge">{day}</span>
                <span>{month} {year}</span>
                <ChevronDown size={18} strokeWidth={2} />
              </div>
              <span className="schedule-panel__today">Aujourd'hui</span>
            </div>

            <button type="button" className="pill-btn">
              Afficher plus <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="schedule-panel__list">
            {SCHEDULE.map((item) =>
              item.pause ? (
                <div key={item.id} className="schedule-pause">
                  <span className="schedule-pause__duration">{item.duration}</span>
                  <span className="schedule-pause__label">Pause</span>
                </div>
              ) : (
                <div key={item.id} className="schedule-slot">
                  <div className="schedule-slot__time">
                    <span className="schedule-slot__start">{item.start}</span>
                    <span className="schedule-slot__end">{item.end}</span>
                  </div>
                  <div className="schedule-slot__card">
                    <span className="schedule-slot__title">{item.title}</span>
                    <span className="schedule-slot__room">{item.room}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section className="panel classes-panel">
          <div className="classes-panel__header">
            <h2 className="panel__title">Classes</h2>
            <ChevronRight size={20} strokeWidth={2} />
          </div>

          <div className="classes-panel__list">
            {CLASSES.map((className) => (
              <button key={className} type="button" className="class-item">
                {className}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
