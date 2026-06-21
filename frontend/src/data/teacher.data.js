/**
 * Données mock du tableau de bord enseignant.
 * À remplacer par des appels API Symfony en production.
 */

export const NAV_ITEMS = [
  { id:'accueil',  label:'Accueil',         icon:'⊞' },
  { id:'search',   label:'Rechercher',      icon:'🔍' },
  { id:'edt',      label:'Emploi du temps', icon:'📅' },
  { id:'creer',    label:'Créer',           icon:'✦'  },
  { id:'gerer',    label:'Gérer',           icon:'⊡'  },
  { id:'params',   label:'Paramètres',      icon:'⚙'  },
]

export const CLASSES = [
  { id:'cc1', name:'1ASSP1', matiere:'Mathématiques', niveau:'Bac Pro', apprenants:28,
    pip:'#f97316', avatars:[{l:'T',c:'#5e5ce6'},{l:'A',c:'#30b0c7'},{l:'L',c:'#ff9500'}] },
  { id:'cc2', name:'1ASSP2', matiere:'Physique-Chimie', niveau:'Bac Pro', apprenants:26,
    pip:'#34c759', avatars:[{l:'A',c:'#af52de'},{l:'L',c:'#34c759'}] },
  { id:'cc3', name:'2AAGA',  matiere:'Anglais', niveau:'CAP', apprenants:24,
    pip:'#af52de', avatars:[{l:'M',c:'#ff6b6b'},{l:'C',c:'#30b0c7'}] },
  { id:'cc4', name:'2PSR',   matiere:'Histoire-Géo', niveau:'CAP', apprenants:22,
    pip:'#007aff', avatars:[{l:'T',c:'#ff9500'},{l:'A',c:'#007aff'}] },
]

export const TASKS = [
  { id:1, icon:'📐', iconBg:'#fff7ed', name:'CCF — Fonctions polynômes',
    desc:'Corriger les copies · 1ASSP1 · 28 apprenants',
    type:'CCF', progress:60, progressColor:'#f97316', progressText:'17/28',
    due:'2 juin', priority:'urgent' },
  { id:2, icon:'⚗️', iconBg:'#eff6ff', name:'CCF — Solutions aqueuses',
    desc:'Corriger les copies · 2AAGA · 24 apprenants',
    type:'CCF', progress:30, progressColor:'#ff3b30', progressText:'7/24',
    due:'3 juin', priority:'urgent' },
  { id:3, icon:'📖', iconBg:'#fdf4ff', name:'Préparer — Pression hydrostatique',
    desc:'Poly + exercices · 2PSR',
    type:'Cours', progress:50, progressColor:'#ff9500', progressText:'En cours',
    due:'5 juin', priority:'normal' },
  { id:4, icon:'⚡', iconBg:'#fef2f2', name:'DS — Circuits électriques',
    desc:'Rédiger sujet + barème · 1ASSP1',
    type:'DS', progress:10, progressColor:'#ff3b30', progressText:'À faire',
    due:'8 juin', priority:'urgent' },
  { id:5, icon:'📊', iconBg:'#f0fdf4', name:'Saisie notes — Probabilités',
    desc:'Saisir dans Pronote · 1ASSP2',
    type:'Notes', progress:100, progressColor:'#34c759', progressText:'Terminé',
    due:'1 juin', priority:'done' },
]

export const EDT_ITEMS = [
  { time:'08:00', dur:'1h',  name:'Mathématiques',  info:'Bât. 2 · 1ASSP1', type:'cours',    lbl:'Cours · 1h',     lc:'#3d3d3f', lb:'#f5f5f5', lbo:'#e5e5e5' },
  { pause:true,   dur:'15 min' },
  { time:'09:15', dur:'1h',  name:'Anglais',        info:'Bât. 3 · 2AAGA',  type:'absent',   lbl:'Prof absent',    lc:'#ff3b30', lb:'#fff1f0', lbo:'#ffd0cc', tc:'#aeaeb2' },
  { time:'10:15', dur:'2h',  name:'Physique-Chimie',info:'Labo 1 · 1ASSP2', type:'cours',    lbl:'Cours · 2h',     lc:'#3d3d3f', lb:'#f5f5f5', lbo:'#e5e5e5' },
  { pause:true,   dur:'1h 15', label:'Pause méridienne' },
  { time:'13:30', dur:'2h',  name:'Histoire-Géo',   info:'Bât. 4 · 2PSR',   type:'td',       lbl:'Travail dirigé', lc:'#ca8a04', lb:'#fefce8', lbo:'#fde68a' },
  { time:'15:30', dur:'1h',  name:'Mathématiques',  info:'Salle A12 · 1ASSP2',type:'eval',   lbl:'Évaluation',     lc:'#34c759', lb:'#f0fdf4', lbo:'#bbf7d0' },
]

export const NOTES_DATA = [
  { label:'Sep', val:12.8 }, { label:'Oct', val:13.2 }, { label:'Nov', val:12.5 },
  { label:'Déc', val:13.8 }, { label:'Jan', val:14.0 }, { label:'Fév', val:14.2 },
]

export const STATS = {
  apprenants: 87, presence: 92, moyenne: 14.2, tachesUrgentes: 2,
  appreciation: [65,85,50,28,72,18,80],
}

export const ACTU = [
  { tag:'Établissement', tc:'#007aff', tb:'#eff6ff',
    title:'Réunion pédagogique — Mardi 3 juin à 17h',
    sub:'Salle des professeurs · Présence obligatoire', time:'Il y a 2h' },
  { tag:'Académique', tc:'#ca8a04', tb:'#fefce8',
    title:'Résultats CCF semestre 1 disponibles',
    sub:"Accessible via Pronote jusqu'au 10 juin", time:'Hier' },
  { tag:'Calendrier', tc:'#166534', tb:'#f0fdf4',
    title:'Conseils de classe — calendrier publié',
    sub:'1ASSP1 : 16 juin · 2AAGA : 17 juin · 2PSR : 18 juin', time:'Il y a 2j' },
]

export const INITIAL_BOOKS = [
  { id:1,  title:'Fonctions polynômes',    cls:'1ASSP1', type:'Cours',  color:'#9f1239' },
  { id:2,  title:'Solutions aqueuses',     cls:'2AAGA',  type:'TP noté',color:'#1e3a5f' },
  { id:3,  title:'Probabilités',           cls:'1ASSP2', type:'Cours',  color:'#4a1942' },
  { id:4,  title:'Circuits électriques',   cls:'1ASSP1', type:'DS',     color:'#1a3c34' },
  { id:5,  title:'Pression hydrostatique', cls:'2PSR',   type:'Cours',  color:'#7c2d12' },
  { id:6,  title:'Second degré',           cls:'2AAGA',  type:'CCF',    color:'#1e3a5f' },
  { id:7,  title:'Boyle-Mariotte',         cls:'2PSR',   type:'TP',     color:'#374151' },
  { id:8,  title:'Histoire coloniale',     cls:'2PSR',   type:'Cours',  color:'#713f12' },
  { id:9,  title:'Évaluation Mai',         cls:'1ASSP2', type:'Éval.',  color:'#1e1b4b' },
]

export const STATS_DETAIL = {
  academic: [
    {v:'14.2',l:'Moyenne générale',    d:'↑ +0.4 vs S0', up:true},
    {v:'78%', l:'Taux de réussite',    d:'↑ +3%',         up:true},
    {v:'22%', l:"Taux d'échec",        d:'À réduire',     up:false},
  ],
  progression: [
    {v:'+1.8',l:'Gain moyen pts',      d:'Sep → Fév',     up:true},
    {v:'64%', l:'En progression',      d:'↑ depuis S0',   up:true},
    {v:'18%', l:'En régression',       d:'À surveiller',  up:false},
  ],
  performance: [
    {v:'2e',  l:'Classement niveau',   d:'Sur 6 classes', up:true},
    {v:'+0.6',l:'Écart vs établissement',d:'Au-dessus moy.',up:true},
    {v:'24%', l:'Notes excellentes',   d:'≥ 16/20',       up:true},
  ],
  matieres: [
    {l:'Mathématiques',p:71,v:'14.2'},
    {l:'Physique-Chimie',p:67,v:'13.4'},
    {l:'Anglais',p:62,v:'12.4'},
    {l:'Histoire-Géo',p:75,v:'15.0'},
  ],
  repartition: [
    {l:'Excellentes',c:'#34c759',p:24},
    {l:'Moyennes',   c:'#ff9500',p:54},
    {l:'Faibles',    c:'#ff3b30',p:22},
  ],
}
