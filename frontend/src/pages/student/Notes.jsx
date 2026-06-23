import MoyenneChart from '../../components/charts/MoyenneChart'

const DATASETS = {
  general: {
    label: 'Moyenne generale',
    points: [
      { label:'8 sept',  val:12.8, classe:11.6, rang:6 },
      { label:'20 oct',  val:9.6,  classe:11.9, rang:15 },
      { label:'4 nov',   val:8.8,  classe:11.7, rang:18 },
      { label:'24 nov',  val:10.4, classe:12.0, rang:12 },
      { label:'8 dec',   val:12.1, classe:12.1, rang:8  },
      { label:'12 jan',  val:13.0, classe:12.2, rang:5  },
      { label:'9 fev',   val:14.0, classe:12.4, rang:3  },
      { label:'15 juin', val:14.2, classe:12.4, rang:3  },
    ],
  },
  maths: {
    label: 'Mathematiques',
    points: [
      { label:'8 sept',  val:11.0, classe:10.8, rang:9  },
      { label:'20 oct',  val:9.0,  classe:10.5, rang:14 },
      { label:'8 dec',   val:13.0, classe:11.2, rang:6  },
      { label:'15 juin', val:14.0, classe:11.4, rang:3  },
    ],
  },
  physique: {
    label: 'Physique-Chimie',
    points: [
      { label:'2 oct',   val:13.5, classe:12.0, rang:5 },
      { label:'9 fev',   val:16.0, classe:12.8, rang:1 },
      { label:'15 juin', val:16.0, classe:13.0, rang:1 },
    ],
  },
}

export default function Notes() {
  return (
    <div style={{ background:'#F2F2F2', minHeight:'100vh', padding:'32px 20px', fontFamily:'-apple-system,sans-serif' }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.8px', marginBottom:24 }}>Notes</h1>
        <MoyenneChart datasets={DATASETS} defaultKey="general" />
      </div>
    </div>
  )
}
