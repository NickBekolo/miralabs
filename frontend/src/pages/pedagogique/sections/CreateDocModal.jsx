import { useState } from 'react'
import { COLORS, FONT_STACK } from '../../../constants/theme'
export function CreateDocModal({ onClose, onCreate }) {
  const [title,setTitle]=useState(''),[cls,setCls]=useState('1ASSP1 — Bac Pro')
  const [type,setType]=useState('Cours magistral'),[color,setColor]=useState(COLORS.bookColors[0])
  const handle=()=>{if(!title.trim())return;onCreate({id:Date.now(),title:title.trim(),cls:cls.split(' ')[0],type,color});onClose()}
  const Field=({label,children})=><div style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:600,color:'#86868b',marginBottom:5}}>{label}</div>{children}</div>
  const sel=(val,onChange,opts)=><select value={val} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'9px 12px',borderRadius:9,border:'1.5px solid #e5e5ea',fontSize:13,fontFamily:FONT_STACK,outline:'none',background:'#fff'}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:22,padding:26,width:'100%',maxWidth:420,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontSize:19,fontWeight:800,marginBottom:18}}>Créer un document</div>
        <Field label="Titre"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex : Cours — Fonctions polynômes" style={{width:'100%',padding:'9px 12px',borderRadius:9,border:'1.5px solid #e5e5ea',fontSize:13,fontFamily:FONT_STACK,outline:'none'}} onFocus={e=>e.target.style.borderColor='#1d1d1f'} onBlur={e=>e.target.style.borderColor='#e5e5ea'}/></Field>
        <Field label="Classe">{sel(cls,setCls,['1ASSP1 — Bac Pro','1ASSP2 — Bac Pro','2AAGA — CAP','2PSR — CAP'])}</Field>
        <Field label="Type">{sel(type,setType,['Cours magistral','Travail dirigé','Évaluation','CCF','TP noté','Devoir'])}</Field>
        <Field label="Couleur">
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:9}}>{COLORS.bookColors.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:8,background:c,cursor:'pointer',border:c===color?'2.5px solid #1d1d1f':'2.5px solid transparent',boxShadow:c===color?'0 0 0 2px #fff,0 0 0 4px #1d1d1f':'none',transform:c===color?'scale(1.1)':'scale(1)',transition:'all 0.15s'}}/>)}</div>
          <div style={{height:40,borderRadius:9,background:color,display:'flex',alignItems:'center',padding:'0 14px'}}><span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.9)'}}>{title||'Titre du document'}</span></div>
        </Field>
        <div style={{display:'flex',gap:8,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:10,borderRadius:980,border:'1.5px solid #e5e5ea',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:FONT_STACK}}>Annuler</button>
          <button onClick={handle} style={{flex:2,padding:10,borderRadius:980,border:'none',background:'#1d1d1f',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:FONT_STACK,opacity:title.trim()?1:0.4}}>Créer le document</button>
        </div>
      </div>
    </div>
  )
}
