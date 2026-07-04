import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { StatsBrick }       from '../../components/bricks'
import { DataTableBrick }   from '../../components/bricks'
import { ActionModalBrick } from '../../components/bricks'
import { Building2, Users, CheckCircle, XCircle, LogOut } from 'lucide-react'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

const ETAB_TYPES = [
  { value:'lycee',       label:'Lycée' },
  { value:'college',     label:'Collège' },
  { value:'universite',  label:'Université' },
  { value:'ecole',       label:'École' },
  { value:'autre',       label:'Autre' },
]

const COLUMNS = [
  { key:'name', label:'Établissement' },
  { key:'code', label:'Code' },
  { key:'type', label:'Type', render: v => (
    <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:980, background:'#F0F0F0', color:'#555' }}>
      {v}
    </span>
  )},
  { key:'isActive', label:'Statut', render: v => (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background: v ? '#4ade80' : '#e5e7eb' }}/>
      <span style={{ fontSize:12, color: v ? '#111' : '#9ca3af' }}>{v ? 'Actif' : 'Inactif'}</span>
    </div>
  )},
  { key:'createdAt', label:'Créé le' },
]

const CREATE_FIELDS = [
  { key:'name',           label:'Nom de l\'établissement', required:true, placeholder:'Lycée Jean Hyppolite', fullWidth:true },
  { key:'code',           label:'Code unique',             required:true, placeholder:'LJH-JONZAC' },
  { key:'type',           label:'Type',                    required:true, type:'select', options:ETAB_TYPES },
  { key:'adresse',        label:'Adresse',                 placeholder:'Jonzac, Charente-Maritime' },
  { key:'adminFirstName', label:'Prénom admin',            required:true, placeholder:'Jean' },
  { key:'adminLastName',  label:'Nom admin',               required:true, placeholder:'Martin' },
  { key:'adminEmail',     label:'Email admin',             required:true, type:'email', placeholder:'admin@lycee.fr', fullWidth:true },
]

export default function PlatformDashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [etabs,     setEtabs]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [modalErr,  setModalErr]  = useState(null)
  const [modalOk,   setModalOk]   = useState(null)

  const fetchEtabs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/platform/etablissements')
      setEtabs(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEtabs() }, [])

  const handleCreate = async (form) => {
    setCreating(true); setModalErr(null); setModalOk(null)
    try {
      await api.post('/api/platform/etablissements', form)
      setModalOk('Établissement créé. Les identifiants ont été envoyés par email.')
      fetchEtabs()
    } catch (err) {
      setModalErr(err.response?.data?.message ?? 'Erreur lors de la création.')
    } finally { setCreating(false) }
  }

  const handleToggle = async (etab) => {
    try {
      await api.patch(`/api/platform/etablissements/${etab.id}/toggle`)
      fetchEtabs()
    } catch {}
  }

  const handleDelete = async (etab) => {
    if (!window.confirm(`Supprimer "${etab.name}" ? Tous ses utilisateurs seront supprimés.`)) return
    try {
      await api.delete(`/api/platform/etablissements/${etab.id}`)
      fetchEtabs()
    } catch {}
  }

  const stats = {
    total:   etabs.length,
    actifs:  etabs.filter(e => e.isActive).length,
    inactifs:etabs.filter(e => !e.isActive).length,
  }

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:'#F8F8F8', overflow:'hidden' }}>

      {/* Sidebar */}
      <div style={{ width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #F0F0F0', display:'flex', flexDirection:'column', padding:'20px 12px' }}>
        <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.4px', color:'#111', padding:'8px 10px', marginBottom:16 }}>
          Miralabs.
        </div>
        <SideItem label="Établissements" active/>
        <div style={{ marginTop:'auto' }}>
          <SideItem
            label="Déconnexion"
            icon={<LogOut size={15}/>}
            onClick={() => { logout(); navigate('/') }}
          />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#111', letterSpacing:'-0.5px', marginBottom:4 }}>
            Bonjour, Miralabs 👋
          </h1>
          <p style={{ fontSize:14, color:'#9ca3af' }}>
            Gérez l'ensemble des établissements de la plateforme.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          <StatsBrick title="Établissements"  value={stats.total}    icon={<Building2 size={18}/>}    color="#6366f1"/>
          <StatsBrick title="Actifs"          value={stats.actifs}   icon={<CheckCircle size={18}/>}  color="#4ade80"/>
          <StatsBrick title="Inactifs"        value={stats.inactifs} icon={<XCircle size={18}/>}      color="#f87171"/>
        </div>

        {/* Tableau des établissements */}
        {loading ? (
          <div style={{ color:'#9ca3af', fontSize:13 }}>Chargement...</div>
        ) : (
          <DataTableBrick
            title="Tous les établissements"
            columns={COLUMNS}
            rows={etabs}
            searchable
            onAdd={() => { setShowModal(true); setModalErr(null); setModalOk(null) }}
            addLabel="+ Nouvel établissement"
            actions={[
              {
                label: row => row.isActive ? 'Désactiver' : 'Activer',
                onClick: handleToggle,
              },
              {
                label: 'Supprimer',
                danger: true,
                onClick: handleDelete,
              },
            ]}
            emptyMsg="Aucun établissement pour l'instant."
          />
        )}
      </div>

      {/* Modal création */}
      {showModal && (
        <ActionModalBrick
          title="Nouvel établissement"
          fields={CREATE_FIELDS}
          onSubmit={handleCreate}
          onCancel={() => setShowModal(false)}
          loading={creating}
          error={modalErr}
          success={modalOk}
          submitLabel="Créer l'établissement"
        />
      )}
    </div>
  )
}

function SideItem({ label, active, onClick, icon }) {
  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'8px 10px', borderRadius:8, cursor:'pointer',
        background: active ? '#F0F0F0' : 'transparent',
        color: active ? '#111' : '#6b7280',
        fontWeight: active ? 600 : 400, fontSize:13, marginBottom:2,
        fontFamily:ft,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F5F5F5' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon && <span style={{ opacity:0.6 }}>{icon}</span>}
      {label}
    </div>
  )
}