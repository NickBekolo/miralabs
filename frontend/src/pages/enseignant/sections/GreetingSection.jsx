export function GreetingSection({ name = 'Dr Mandeng', nbCours = 5, nbTaches = 5 }) {
  return (
    <div style={{ marginBottom:18 }}>
      <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.7px', marginBottom:3 }}>
        Bonjour, {name}
      </h1>
      <p style={{ fontSize:13, color:'#86868b' }}>
        Vous avez {nbCours} cours aujourd'hui, et {nbTaches} tâches urgentes.
      </p>
    </div>
  )
}
