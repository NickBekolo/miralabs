import { useRef, useState, useEffect } from 'react';
import { Plus, Image, Paperclip, Camera, ArrowUp, X } from 'lucide-react';
import { useThemeStore } from '../store/ThemeStore';

export default function MessageInputBar({ onSend, replyTo, onCancelReply }) {
  const darkMode = useThemeStore((s) => s.darkMode);
  const profileColor = useThemeStore((s) => s.profileColor) || '#007AFF';

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const menuRef = useRef(null);

  const bg = darkMode ? '#0a0a0a' : '#fff';
  const surface = darkMode ? '#1c1c1e' : '#f2f2f7';
  const border = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = darkMode ? '#fff' : '#0a0a0a';
  const placeholderColor = '#8E8E93';

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [text]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleFiles = (files) => {
    const list = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setAttachments((prev) => [...prev, ...list]);
    setMenuOpen(false);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const a = prev.find(x => x.id === id);
      if (a?.preview) URL.revokeObjectURL(a.preview);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSend?.({ content: text.trim(), attachments, replyToId: replyTo?.id ?? null, replyToText: replyTo?.text ?? null });
    setText('');
    setAttachments([]);
    onCancelReply?.();
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const canSend = text.trim().length > 0 || attachments.length > 0;

  return (
    <div style={{ fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif", padding:'8px 12px 12px', background:bg, borderTop:`1px solid ${border}` }}>

      {/* Bandeau réponse */}
      {replyTo && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:surface, borderRadius:12, padding:'8px 12px', marginBottom:8, fontSize:13 }}>
          <div style={{ color:placeholderColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            Réponse à : <span style={{ color:textColor }}>{replyTo.text}</span>
          </div>
          <button onClick={onCancelReply} style={{ background:'none', border:'none', cursor:'pointer', color:placeholderColor, display:'flex' }}>
            <X size={16}/>
          </button>
        </div>
      )}

      {/* Aperçus pièces jointes */}
      {attachments.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
          {attachments.map((a) => (
            <div key={a.id} style={{ position:'relative', width:56, height:56, borderRadius:10, overflow:'hidden', background:surface, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {a.preview ? (
                <img src={a.preview} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              ) : (
                <Paperclip size={22} color={placeholderColor}/>
              )}
              <button onClick={() => removeAttachment(a.id)}
                style={{ position:'absolute', top:2, right:2, width:16, height:16, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 }}>
                <X size={10}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Barre saisie */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:8, background:surface, borderRadius:24, padding:'6px' }}>

        {/* Bouton + */}
        <div style={{ position:'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)}
            style={{ width:32, height:32, borderRadius:'50%', border:'none', background:darkMode?'#2c2c2e':'#e5e5ea', color:textColor, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transform:menuOpen?'rotate(45deg)':'none', transition:'transform 0.15s ease' }}>
            <Plus size={18}/>
          </button>

          {menuOpen && (
            <div style={{ position:'absolute', bottom:44, left:0, background:darkMode?'rgba(44,44,46,0.92)':'rgba(242,242,247,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderRadius:28, boxShadow:'0 8px 30px rgba(0,0,0,0.2)', overflow:'hidden', minWidth:260, padding:6, zIndex:20 }}>
              <MenuItem icon={<Camera size={20}/>} label="Caméra" darkMode={darkMode} textColor={textColor} onClick={() => cameraInputRef.current?.click()}/>
              <MenuItem icon={<Image size={20}/>} label="Photos" darkMode={darkMode} textColor={textColor} onClick={() => photoInputRef.current?.click()}/>
              <MenuItem icon={<Paperclip size={20}/>} label="Fichiers" darkMode={darkMode} textColor={textColor} onClick={() => fileInputRef.current?.click()}/>
            </div>
          )}

          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files && handleFiles(e.target.files)}/>
          <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)}/>
          <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)}/>
        </div>

        {/* Textarea */}
        <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Écrire un message..." rows={1}
          style={{ flex:1, resize:'none', border:'none', outline:'none', background:'transparent', color:textColor, fontSize:15, lineHeight:'20px', padding:'6px 4px', maxHeight:160, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}/>

        {/* Bouton envoyer */}
        <button onClick={handleSend} disabled={!canSend}
          style={{ width:32, height:32, borderRadius:'50%', border:'none', background:canSend?profileColor:(darkMode?'#2c2c2e':'#d1d1d6'), color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:canSend?'pointer':'default', flexShrink:0, transition:'background 0.15s ease' }}>
          <ArrowUp size={18}/>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, textColor, darkMode }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'10px 12px', background:hover?(darkMode?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'):'none', border:'none', borderRadius:20, cursor:'pointer', color:textColor, fontSize:17, fontWeight:600, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif", transition:'background 0.1s ease' }}>
      <span style={{ width:34, height:34, borderRadius:'50%', background:darkMode?'#3a3a3c':'#e5e5ea', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:textColor }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
