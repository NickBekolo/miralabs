import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  CalendarDays,
  Video,
  Plus,
  Smile,
  Camera,
  Mic,
} from 'lucide-react';
import './ChatChannel.css';

const TABS = ['Conversation', 'Détails', 'Applications'];

const AVATAR_COLORS = ['#f6c343', '#7cc4a3', '#8f8fe0', '#f39a9a', '#6ec6e0'];

function colorFor(name) {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const DEFAULT_CHANNEL = {
  name: 'Terminale A - Général',
  participants: 32,
};

const DEFAULT_EVENT = {
  label: 'vendredi 31 juillet 2026 @ 09:00',
};

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: 'Mme Fournier',
    type: 'gif',
    mediaUrl: '/chat/rentree.gif',
  },
  {
    id: 2,
    sender: 'Mme Fournier',
    type: 'text',
    text: 'Révisions de rentrée avec ',
    mention: 'Hugo LIEGEARD',
  },
  {
    id: 3,
    sender: 'Mme Fournier',
    type: 'text',
    text: 'Bonne journée à tous',
  },
  {
    id: 4,
    sender: 'Thi Van Anh Nguyen',
    type: 'text',
    text: 'Merci',
  },
  {
    id: 5,
    sender: 'Safi Bougherara',
    type: 'deleted',
  },
  {
    id: 6,
    type: 'system',
    text: '31 juillet, 17:28',
  },
  {
    id: 7,
    type: 'meeting-end',
    text: 'La réunion est terminée : 0 h 45 m 12 s.',
  },
];

function groupMessages(messages) {
  const groups = [];
  messages.forEach((msg) => {
    if (msg.type === 'system' || msg.type === 'meeting-end') {
      groups.push({ system: true, items: [msg] });
      return;
    }
    const last = groups[groups.length - 1];
    if (last && !last.system && last.sender === msg.sender) {
      last.items.push(msg);
    } else {
      groups.push({ sender: msg.sender, items: [msg] });
    }
  });
  return groups;
}

export default function ChatChannel({
  channel = DEFAULT_CHANNEL,
  event = DEFAULT_EVENT,
  messages: initialMessages = DEFAULT_MESSAGES,
  currentUser = 'Moi',
  onJoinMeeting = () => {},
  onBack = () => {},
}) {
  const [activeTab, setActiveTab] = useState('Conversation');
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const groups = useMemo(() => groupMessages(messages), [messages]);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: currentUser, type: 'text', text },
    ]);
    setDraft('');
  }

  return (
    <div className="chat-channel">
      <header className="chat-channel__header">
        <button type="button" className="chat-icon-btn" onClick={onBack} aria-label="Retour">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        <div className="chat-channel__avatar">
          <CalendarDays size={20} strokeWidth={2} color="#ffffff" />
        </div>

        <div className="chat-channel__title">
          <span className="chat-channel__name">{channel.name}</span>
          <span className="chat-channel__count">{channel.participants} participants</span>
        </div>

        <button type="button" className="chat-icon-btn" aria-label="Options">
          <MoreHorizontal size={22} strokeWidth={2} />
        </button>
      </header>

      <nav className="chat-channel__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`chat-tab${activeTab === tab ? ' chat-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {event && (
        <div className="chat-event">
          <span>{event.label}</span>
          <button type="button" className="chat-event__join" onClick={onJoinMeeting}>
            Rejoindre
          </button>
        </div>
      )}

      <div className="chat-channel__body">
        {groups.map((group, i) => {
          if (group.system) {
            const item = group.items[0];
            return (
              <div key={item.id} className="chat-system">
                {item.type === 'meeting-end' && <Video size={16} strokeWidth={2} />}
                <span>{item.text}</span>
              </div>
            );
          }

          const mine = group.sender === currentUser;

          return (
            <div key={i} className={`chat-run${mine ? ' chat-run--mine' : ''}`}>
              {!mine && (
                <div
                  className="chat-run__avatar"
                  style={{ background: colorFor(group.sender) }}
                >
                  {initials(group.sender)}
                </div>
              )}

              <div className="chat-run__content">
                {!mine && <span className="chat-run__name">{group.sender}</span>}

                {group.items.map((msg) => {
                  if (msg.type === 'gif') {
                    return (
                      <div key={msg.id} className="chat-bubble chat-bubble--media">
                        <img src={msg.mediaUrl} alt="GIF partagé" />
                        <span className="chat-bubble__media-tag">GIF</span>
                      </div>
                    );
                  }
                  if (msg.type === 'deleted') {
                    return (
                      <div key={msg.id} className="chat-bubble chat-bubble--deleted">
                        Ce message a été supprimé.
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className="chat-bubble">
                      {msg.text}
                      {msg.mention && <span className="chat-bubble__mention">{msg.mention}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <form className="chat-channel__input" onSubmit={handleSend}>
        <button type="button" className="chat-input__plus" aria-label="Ajouter une pièce jointe">
          <Plus size={20} strokeWidth={2} color="#ffffff" />
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tapez un message"
        />
        <button type="button" className="chat-icon-btn" aria-label="Émoji">
          <Smile size={20} strokeWidth={1.75} />
        </button>
        <button type="button" className="chat-icon-btn" aria-label="Photo">
          <Camera size={20} strokeWidth={1.75} />
        </button>
        <button type="submit" className="chat-icon-btn" aria-label="Message vocal">
          <Mic size={20} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
