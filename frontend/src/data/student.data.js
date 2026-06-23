export const MOYENNE_DATASETS = {
  general: {
    label: 'Moyenne générale',
    points: [
      { label:'8 sept',  val:12.8, classe:11.6, rang:6  },
      { label:'22 sept', val:13.4, classe:11.9, rang:5  },
      { label:'20 oct',  val:9.6,  classe:11.9, rang:15 },
      { label:'4 nov',   val:8.8,  classe:11.7, rang:18 },
      { label:'24 nov',  val:10.4, classe:12.0, rang:12 },
      { label:'8 déc',   val:12.1, classe:12.1, rang:8  },
      { label:'12 jan',  val:13.0, classe:12.2, rang:5  },
      { label:'9 fév',   val:14.0, classe:12.4, rang:3  },
      { label:'16 avr',  val:14.0, classe:12.5, rang:3  },
      { label:'15 juin', val:14.2, classe:12.4, rang:3  },
    ],
  },
  maths: {
    label: 'Mathématiques',
    points: [
      { label:'8 sept',  val:11.0, classe:10.8, rang:9  },
      { label:'20 oct',  val:9.0,  classe:10.5, rang:14 },
      { label:'8 déc',   val:13.0, classe:11.2, rang:6  },
      { label:'15 juin', val:14.0, classe:11.4, rang:3  },
    ],
  },
  physique: {
    label: 'Physique-Chimie',
    points: [
      { label:'2 oct',   val:13.5, classe:12.0, rang:5 },
      { label:'9 fév',   val:16.0, classe:12.8, rang:1 },
      { label:'15 juin', val:16.0, classe:13.0, rang:1 },
    ],
  },
  francais: {
    label: 'Français',
    points: [
      { label:'15 sept', val:12.0, classe:11.5, rang:7  },
      { label:'4 nov',   val:8.0,  classe:11.0, rang:20 },
      { label:'26 jan',  val:11.5, classe:11.8, rang:10 },
      { label:'15 juin', val:12.0, classe:11.9, rang:9  },
    ],
  },
}

export const COURS_AUJOURD_HUI = [
  { name:"Traitement de l'information", meta:'Bât. 10 · Baptiste V.', time:'10:15', annule:false },
  { name:'Physique-Chimie',             meta:'Labo 1 · Mme Martin',   time:'13:30', annule:false },
  { name:'Anglais',                     meta:'Bât. 9 · Pullen A.',    time:'15:30', annule:true  },
  { name:'Mathématiques',               meta:'Salle A12 · M. Dupont', time:'17:00', annule:false },
]

export const COURS_MOBILE = [
  { matiere:'Physique-Chimie', type:'TP',    debut:'10:15', fin:'12:15', salle:'Labo 1',   prof:'Mme Martin',  etudiants:['AA','BK','CM'], nbTotal:27, statut:'en-cours' },
  { matiere:'Mathématiques',   type:'Cours', debut:'13:30', fin:'15:30', salle:'A12',      prof:'M. Dupont',   etudiants:['DL','EN'],      nbTotal:27, statut:'normal'   },
  { matiere:'Anglais',         type:'TD',    debut:'15:30', fin:'16:30', salle:'Bât. 9',   prof:'Pullen A.',   etudiants:[],               nbTotal:0,  statut:'annule'   },
]

export const DEVOIRS = [
  { title:'Exercices polynômes', sub:'Mathématiques', date:'23/06', urgent:true  },
  { title:'Dissertation',        sub:'Français',      date:'25/06', urgent:false },
  { title:'Compte-rendu TP',     sub:'Physique',      date:'28/06', urgent:false },
]

export const NOTES_RECENTES = [
  { score:16, matiere:'Physique-Chimie', type:'TP noté',     date:'9 juin',  low:false },
  { score:14, matiere:'Mathématiques',   type:'Évaluation',  date:'12 juin', low:false },
  { score:8,  matiere:'Français',        type:'Dissertation', date:'15 juin', low:true  },
]

export const ACTUALITES = [
  { tag:'Établissement', tagRed:false, title:'Réunion parents-professeurs', sub:'Vendredi 13 juin à 17h', time:'Il y a 2h' },
  { tag:'Urgent',        tagRed:true,  title:'Sortie pédagogique annulée',  sub:'Rattrapage à venir',     time:'Hier'      },
  { tag:'Calendrier',    tagRed:false, title:'Inscriptions examens ouvertes',sub:"Jusqu'au 30 juin",      time:'Il y a 2j' },
]

export const BOOKS = [
  { title:'Fonctions polynômes',    color:'#1e3a5f' },
  { title:'Solutions aqueuses',     color:'#9f1239' },
  { title:'Probabilités',           color:'#4a1942' },
  { title:'Circuits électriques',   color:'#1a3c34' },
  { title:'Pression hydrostatique', color:'#7c2d12' },
  { title:'Second degré',           color:'#374151' },
  { title:'Boyle-Mariotte',         color:'#1e3a5f' },
  { title:'Histoire coloniale',     color:'#713f12' },
]

export const ABSENCES_JUIN = [11, 20]
export const TODAY_DATE    = 23
