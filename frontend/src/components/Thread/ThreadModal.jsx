import { useState } from 'react';
import {
  ArrowLeft,
  Send,
  MoreHorizontal,
  Smile,
  FileText,
  Paperclip,
} from 'lucide-react';
import './ThreadModal.css';

const DEFAULT_POST = {
  author: { name: 'M. Dubois', avatar: '/avatars/teacher-1.jpg', verified: true },
  postedAt: 'il y a 2 heures',
  type: 'text',
  title: 'Contrôle de mathématiques',
  content:
    "N'oubliez pas : le contrôle sur les suites numériques aura lieu vendredi. Le programme couvre les chapitres 4 et 5. Bon courage à tous !",
};

const DEFAULT_REACTIONS = [
  { user: 'clara.t', avatar: '/avatars/u1.jpg', emoji: '😍' },
  { user: 'amder08', avatar: '/avatars/u2.jpg', emoji: '👍' },
  { user: 'alexdum25', avatar: '/avatars/u3.jpg', emoji: '🔥' },
  { user: 'hvk_23', avatar: '/avatars/u4.jpg', emoji: '😍' },
];

const DEFAULT_COMMENTS = [
  {
    id: 1,
    user: 'val_m017',
    avatar: '/avatars/u5.jpg',
    date: '22 juil. à 15:44',
    text: 'Merci pour le rappel !',
  },
  {
    id: 2,
    user: 'totosonic_7',
    avatar: '/avatars/u6.jpg',
    date: '22 juil. à 15:50',
    text: 'Est-ce que la calculatrice est autorisée ?',
  },
  {
    id: 3,
    user: 'hu_go76',
    avatar: '/avatars/u7.jpg',
    date: '22 juil. à 16:02',
    text: 'Ok reçu, merci monsieur.',
  },
];

export default function ThreadModal({
  post = DEFAULT_POST,
  reactions = DEFAULT_REACTIONS,
  comments: initialComments = DEFAULT_COMMENTS,
  onClose = () => {},
}) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'moi',
        avatar: '/avatars/me.jpg',
        date: "à l'instant",
        text,
      },
    ]);
    setDraft('');
  }

  return (
    <div className="thread-overlay" role="dialog" aria-modal="true">
      <div className="thread-modal">
        <header className="thread-header">
          <button type="button" className="thread-icon-btn" onClick={onClose} aria-label="Retour">
            <ArrowLeft size={22} strokeWidth={2} />
          </button>

          <div className="thread-header__author">
            <img src={post.author.avatar} alt="" className="thread-header__avatar" />
            <div>
              <span className="thread-header__name">{post.author.name}</span>
              <span className="thread-header__time">{post.postedAt}</span>
            </div>
          </div>

          <div className="thread-header__actions">
            <button type="button" className="thread-icon-btn" aria-label="Partager">
              <Send size={20} strokeWidth={2} />
            </button>
            <button type="button" className="thread-icon-btn" aria-label="Options">
              <MoreHorizontal size={22} strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="thread-body">
          <div className="thread-post">
            {post.type === 'image' && (
              <div className="thread-post__media">
                <img src={post.content} alt={post.title ?? 'Pièce jointe'} />
              </div>
            )}

            {post.type === 'file' && (
              <div className="thread-post__file">
                <FileText size={28} strokeWidth={1.75} />
                <div>
                  <span className="thread-post__filename">{post.fileName}</span>
                  <span className="thread-post__filemeta">Document joint</span>
                </div>
                <Paperclip size={18} strokeWidth={2} className="thread-post__clip" />
              </div>
            )}

            {post.title && <h2 className="thread-post__title">{post.title}</h2>}
            {post.content && post.type === 'text' && (
              <p className="thread-post__text">{post.content}</p>
            )}
          </div>

          <section className="thread-section">
            <h3>
              Réactions <span>{reactions.length}</span>
            </h3>
            <div className="thread-reactions">
              {reactions.map((r) => (
                <div key={r.user} className="thread-reaction">
                  <div className="thread-reaction__avatar">
                    <img src={r.avatar} alt="" />
                    <span className="thread-reaction__emoji">{r.emoji}</span>
                  </div>
                  <span className="thread-reaction__name">{r.user}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="thread-section thread-section--comments">
            <h3>
              Commentaires <span>{comments.length}</span>
            </h3>
            <ul className="thread-comments">
              {comments.map((c) => (
                <li key={c.id} className="thread-comment">
                  <img src={c.avatar} alt="" className="thread-comment__avatar" />
                  <div className="thread-comment__body">
                    <div className="thread-comment__meta">
                      <span className="thread-comment__user">{c.user}</span>
                      <span className="thread-comment__date">{c.date}</span>
                    </div>
                    <p className="thread-comment__text">{c.text}</p>
                    <button type="button" className="thread-comment__reply">
                      Répondre
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <form className="thread-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ajouter un commentaire..."
          />
          <button type="submit" className="thread-input__emoji" aria-label="Envoyer">
            <Smile size={22} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
