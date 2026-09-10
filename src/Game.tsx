import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChevronRight, CircleHelp, RotateCcw, Search, Sparkles, WandSparkles } from 'lucide-react';

type Element = { id:string; name:string; glyph:string; color:string; base?:boolean; desc:string };
const base:Element[]=[
 {id:'fire',name:'Feuer',glyph:'✦',color:'#ff785a',base:true,desc:'Die ungezähmte Kraft der Hitze.'},
 {id:'water',name:'Wasser',glyph:'≋',color:'#55c6ed',base:true,desc:'Der ewige Fluss.'},
 {id:'earth',name:'Erde',glyph:'◆',color:'#c49a70',base:true,desc:'Der feste Grund.'},
 {id:'air',name:'Luft',glyph:'◌',color:'#c1e5e8',base:true,desc:'Der unsichtbare Atem.'},
 {id:'aether',name:'Äther',glyph:'✧',color:'#bd91ff',base:true,desc:'Das Zwischenreich.'},
];
const recipes:Record<string,Element>={
 'fire+water':{id:'steam',name:'Dampf',glyph:'☁',color:'#d6edef',desc:'Wasser, das sich erhebt.'},
 'earth+water':{id:'mud',name:'Schlamm',glyph:'◈',color:'#a38264',desc:'Der erste Schritt zum Leben.'},
 'air+earth':{id:'dust',name:'Staub',glyph:'⁙',color:'#d7bd94',desc:'Erde auf Reisen.'},
 'earth+fire':{id:'lava',name:'Lava',glyph:'⌁',color:'#f16b45',desc:'Erde im flüssigen Zustand.'},
 'air+water':{id:'cloud',name:'Wolke',glyph:'☁',color:'#a8d3df',desc:'Ein Träger des Regens.'},
 'aether+fire':{id:'light',name:'Licht',glyph:'✧',color:'#ffe58b',desc:'Ein Funke im Nichts.'},
};
const key=(a:string,b:string)=>[a,b].sort().join('+');
export default function Game(){
 const [found,setFound]=useState<Element[]>(()=>{try{return JSON.parse(localStorage.getItem('ic-found')||'[]')}catch{return[]}});
 const [picked,setPicked]=useState<string[]>([]); const [active,setActive]=useState('fire'); const [query,setQuery]=useState(''); const [help,setHelp]=useState(false); const [message,setMessage]=useState('Wähle zwei Elemente, um zu beginnen.');
 useEffect(()=>localStorage.setItem('ic-found',JSON.stringify(found)),[found]);
 const all=useMemo(()=>[...base,...found].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i),[found]);
 const shown=all.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())); const current=all.find(x=>x.id===active)||base[0];
 const pick=(x:Element)=>{setActive(x.id);setPicked(picked.length===2?[x.id]:[...picked,x.id]);setMessage('');};
 const combine=()=>{if(picked.length!==2)return;const result=recipes[key(picked[0],picked[1])];if(!result){setMessage('Diese Verbindung hat noch keine bekannte Form.');return}setFound(x=>x.some(y=>y.id===result.id)?x:[...x,result]);setActive(result.id);setPicked([]);setMessage(`${result.name} entdeckt – diese Form bleibt für immer festgelegt.`)};
 const reset=()=>{setPicked([]);setMessage('Wähle zwei Elemente, um zu beginnen.');};
 const clear=()=>{localStorage.removeItem('ic-found');setFound([]);setActive('fire');reset();};
 return <div className="app"><header><div className="logo"><span><Sparkles size={17}/></span><b>INFINITY</b><i>CRAFT</i></div><div className="saved">● Fortschritt lokal gespeichert <button onClick={()=>setHelp(!help)}><CircleHelp size={18}/></button></div></header><div className="body"><aside><div className="overline">DEIN ARCHIV</div><h1>Elemente</h1><div className="search"><Search size={15}/><input placeholder="Suchen …" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="list">{shown.map(x=><button className={active===x.id?'chosen':''} onClick={()=>pick(x)} key={x.id}><em style={{color:x.color}}>{x.glyph}</em><span><b>{x.name}</b><small>{x.base?'Grundstoff':'Entdeckt'} · ∞</small></span><ChevronRight size={14}/></button>)}</div><div className="infinite"><strong>∞</strong><span><b>Unendlicher Vorrat</b><small>Alles Entdeckte bleibt verfügbar.</small></span></div></aside><main><div className="heading"><div><div className="overline">DIE ALCHEMIE BEGINNT</div><h2>Was entsteht, wenn du verbindest?</h2><p>Kombiniere zwei Elemente und erschaffe etwas, das es vorher nicht gab.</p></div><button className="reset" onClick={reset}><RotateCcw size={14}/> Leeren</button></div>{help&&<div className="help"><CircleHelp size={16}/><span>Jede Kombination hat genau ein Ergebnis. Das Rezept wird lokal gespeichert und ändert sich nie.</span></div>}<section className="forge"><div className="grid"/><div className="slots"><Slot item={all.find(x=>x.id===picked[0])} clear={()=>setPicked(picked.slice(1))}/><b>+</b><Slot item={all.find(x=>x.id===picked[1])} clear={()=>setPicked([picked[0]])}/></div><button className={picked.length===2?'combine ready':'combine'} disabled={picked.length!==2} onClick={combine}><WandSparkles size={17}/>{picked.length===2?'Kombinieren':'Zwei auswählen'}</button><p>{message}</p></section><div className="recent"><div><div className="overline">DEINE ENTDECKUNGEN</div><h3>{found.length} neue Formen gefunden</h3></div><div className="cards">{found.length?found.slice().reverse().map(x=><button className={active===x.id?'card active':'card'} onClick={()=>setActive(x.id)} key={x.id}><span style={{color:x.color}}>{x.glyph}</span><b>{x.name}</b><small>{x.desc}</small></button>):<div className="empty">Noch keine Entdeckungen. Die erste wartet auf dich.</div>}</div></div></main><aside className="details"><div className="overline">ELEMENT-DETAILS</div><div className="art" style={{'--color':current.color} as CSSProperties}><span>{current.glyph}</span></div><label>{current.base?'GRUNDSTOFF':'ENTDECKT'}</label><h2>{current.name}</h2><p>{current.desc}</p><hr/><div className="meta"><span>VORRAT<strong>∞ Unbegrenzt</strong></span><span>STATUS<strong>● Gesichert</strong></span></div>{!current.base&&<div className="recipe"><div className="overline">ENTSTANDEN AUS</div><b>Eine eindeutige, unveränderliche Verbindung</b></div>}<button className="clear" onClick={clear}>Spielstand zurücksetzen</button></aside></div><footer>INFINITYCRAFT <span>·</span> Eine Welt aus Möglichkeiten</footer></div>
}
function Slot({item,clear}:{item?:Element;clear:()=>void}){return <div className={item?'slot filled':'slot'}>{item?<><button className="x" onClick={clear}>×</button><i style={{color:item.color}}>{item.glyph}</i><b>{item.name}</b><small>∞ verfügbar</small></>:<><strong>+</strong><small>Element auswählen</small></>}</div>}
