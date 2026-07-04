/**
 * UserCardBrick — Carte utilisateur
 *
 * Props :
 *   user        : { id, firstName, lastName, email, roles, isActive, createdAt }
 *   showActions : bool
 *   onToggle    : fn(user)
 *   onDelete    : fn(user)
 */

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

const ROLE_STYLES = {
  ROLE_STUDENT:              { bg:'#F0FDF4', color:'#166534', label:'Étudiant' },
  ROLE_TEACHER:              { bg:'#EFF6FF', color:'#1d4ed8', label:'Enseignant' },
  ROLE_PARENT:               { bg:'#FFF7ED', color:'#c2410c', label:'Parent' },
  ROLE_DIRECTEUR:            { bg:'#F5F3FF', color:'#7c3aed', label:'Directeur' },
  ROLE_DIRECTEUR_ADJOINT:    { bg:'#F5F3FF', color:'#7c3aed', label:'Dir. Adjoint' },
  ROLE_SERVICE_PEDAGOGIQUE:  { bg:'#ECFDF5', color:'#065f46', label:'Service Péda.' },
  ROLE_CPE:                  { bg:'#FFF7ED', color:'#c2410c', label:'CPE' },
  ROLE_SECRETARIAT:          { bg:'#EFF6FF', color:'#1d4ed8', label:'Secrétariat' },
  ROLE_COMPTABILITE:         { bg:'#FEF3C7', color:'#d97706', label:'Comptabilité' },
  ROLE_SURVEILLANT:          { bg:'#F1F5F9', color:'#475569', label:'Surveillant' },
  ROLE_ADMIN:                { bg:'#111',    color:'#fff',    label:'Admin' },
  ROLE_SUPER_ADMIN:          { bg:'#111',    color:'#fff',    label:'Super Admin' },
}

function getMainRole(roles) {
  const priority = ['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_DIRECTEUR','ROLE_DIRECTEUR_ADJOINT','ROLE_SERVICE_PEDAGOGIQUE','ROLE_CPE','ROLE_SECRETARIAT','ROLE_COMPTABILITE','ROLE_SURVEILLANT','ROLE_TEACHER','ROLE_PARENT','ROLE_STUDENT']
  return priority.find(r => roles.includes(r)) ?? roles[0]
}

function initials(f, l) { return ((f?.[0] ?? '') + (l?.[0] ?? '')).toUpperCase() }

export default function UserCardBrick({ user, showActions = true, onToggle, onDelete }) {
  const role      = getMainRole(user.roles)
  const roleStyle = ROLE_STYLES[role] ?? { bg:'#F5F5F5', color:'#111', label:role }

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', background:'#fff',
      border:'1px solid #F0F0F0', borderRadius:12, fontFamily:ft,
    }}>
      {/* Avatar */}
      <div style={{
        width:36, height:36, borderRadius:'50%',
        background: user.isActive ? '#111' : '#d1d5db',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, flexShrink:0,
      }}>
        {initials(user.firstName, user.lastName)}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#111', marginBottom:2 }}>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ fontSize:11, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {user.email}
        </div>
      </div>

      {/* Badge rôle */}
      <span style={{
        fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:980,
        background:roleStyle.bg, color:roleStyle.color, flexShrink:0,
      }}>
        {roleStyle.label}
      </span>

      {/* Statut */}
      <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background: user.isActive ? '#4ade80' : '#e5e7eb' }}/>
        <span style={{ fontSize:11, color: user.isActive ? '#111' : '#9ca3af' }}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {onToggle && (
            <ActionBtn onClick={() => onToggle(user)}>
              {user.isActive ? 'Désactiver' : 'Activer'}
            </ActionBtn>
          )}
          {onDelete && (
            <ActionBtn danger onClick={() => onDelete(user)}>Supprimer</ActionBtn>
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600,
        cursor:'pointer', fontFamily:'-apple-system,sans-serif',
        border: danger ? '1px solid #fecaca' : '1px solid #E5E7EB',
        background:'#fff', color: danger ? '#dc2626' : '#111',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#FFF0F0' : '#F5F5F5'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      {children}
    </button>
  )
}