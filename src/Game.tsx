import { useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { ChevronRight, CircleHelp, RotateCcw, Search, Sparkles, WandSparkles, BrainCircuit } from 'lucide-react';

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
 'aether+aether':{id:'life',name:'Leben',glyph:'♡',color:'#8fe58b',desc:'Der erste Puls in der unendlichen Welt.'},
};
const key=(a:string,b:string)=>[a,b].sort().join('+');
const hash=(value:string)=>{let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const aiWords=[['Glut','Glanz','Nebel','Kern','Hauch','Woge','Funke','Schatten','Kristall','Strom','Blüte','Echo'],['stein','flug','licht','brand','hauch','quell','staub','herz','wind','saum','welle','kreis']];
const aiGlyphs=['✦','◈','✧','⌁','✺','◌','◇','⊹','☼','⁙'];
const properties:Record<string,string>={fire:'Hitze',water:'Flüssigkeit',earth:'Festigkeit',air:'Bewegung',aether:'Möglichkeit',steam:'Druck',mud:'Fruchtbarkeit',dust:'Trockenheit',lava:'Glut',cloud:'Feuchtigkeit',light:'Helligkeit',life:'Wachstum'};
function generateProperty(element:Element):Element{
 const name=properties[element.id]||['Form','Kraft','Struktur','Energie'][hash(element.id)%4];
 const seed=hash('property:'+element.id);
 return {id:`property-${element.id}`,name,glyph:'◇',color:`hsl(${seed%360} 68% 72%)`,desc:`Eine wesentliche Eigenschaft von ${element.name}.`};
}
function generateWithAI(a:Element,b:Element):Element{
 const seed=hash(key(a.id,b.id)); const word=aiWords[0][seed%aiWords[0].length]+aiWords[1][Math.floor(seed/17)%aiWords[1].length];
 return {id:`ai-${seed.toString(36)}`,name:word,glyph:aiGlyphs[Math.floor(seed/29)%aiGlyphs.length],color:`hsl(${seed%360} 68% 70%)`,desc:`Eine neue Form aus ${a.name} und ${b.name}, von der Infinity-KI festgelegt.`};
}
export default function Game(){
 const [found,setFound]=useState<Element[]>(()=>{try{return JSON.parse(localStorage.getItem('ic-found')||'[]')}catch{return[]}});
 const [picked,setPicked]=useState<string[]>([]); const [active,setActive]=useState('fire'); const [query,setQuery]=useState(''); const [help,setHelp]=useState(false); const [message,setMessage]=useState('Wähle zwei Elemente, um zu beginnen.');
 useEffect(()=>localStorage.setItem('ic-found',JSON.stringify(found)),[found]);
 const all=useMemo(()=>[...base,...found].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i),[found]);
 const shown=all.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())); const current=all.find(x=>x.id===active)||base[0];
 const pick=(x:Element)=>{setActive(x.id);setPicked(picked.length===2?[x.id]:[...picked,x.id]);setMessage('');};
 const dragStart=(event:DragEvent<HTMLButtonElement>,x:Element)=>{event.dataTransfer.setData('text/infinity-element',x.id);event.dataTransfer.effectAllowed='copy';setActive(x.id)};
 const dropElement=(event:DragEvent<HTMLDivElement>,slot:number)=>{event.preventDefault();const id=event.dataTransfer.getData('text/infinity-element');const element=all.find(x=>x.id===id);if(!element)return;setActive(element.id);setPicked(previous=>{const next=[...previous];next[slot]=element.id;return next.filter(Boolean)});setMessage('');};
 const allowDrop=(event:DragEvent<HTMLDivElement>)=>{event.preventDefault();event.dataTransfer.dropEffect='copy'};
 const makeProperty=()=>{if(picked.length!==1)return;const element=all.find(x=>x.id===picked[0]);if(!element)return;const result=generateProperty(element);setFound(x=>x.some(y=>y.id===result.id)?x:[...x,result]);setActive(result.id);setPicked([]);setMessage(`${result.name} erzeugt – eine feste Eigenschaft von ${element.name}.`)};
 const combine=()=>{if(picked.length!==2)return;const first=all.find(x=>x.id===picked[0])||base[0];const second=all.find(x=>x.id===picked[1])||base[0];const result=recipes[key(first.id,second.id)]||generateWithAI(first,second);setFound(x=>x.some(y=>y.id===result.id)?x:[...x,result]);setActive(result.id);setPicked([]);setMessage(`${result.name} entdeckt – die Infinity-KI hat dieses Ergebnis dauerhaft festgelegt.`)};
 const reset=()=>{setPicked([]);setMessage('Wähle zwei Elemente, um zu beginnen.');};
 const clear=()=>{localStorage.removeItem('ic-found');setFound([]);setActive('fire');reset();};
 return <div className="app"><header><div className="logo"><span><Sparkles size={17}/></span><b>INFINITY</b><i>CRAFT</i></div><div className="saved">● Fortschritt lokal gespeichert <button onClick={()=>setHelp(!help)}><CircleHelp size={18}/></button></div></header><div className="body"><aside><div className="overline">DEIN ARCHIV</div><h1>Elemente</h1><div className="search"><Search size={15}/><input placeholder="Suchen …" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="list">{shown.map(x=><button draggable className={active===x.id?'chosen':''} onDragStart={event=>dragStart(event,x)} onClick={()=>pick(x)} key={x.id}><em style={{color:x.color}}>{x.glyph}</em><span><b>{x.name}</b><small>{x.base?'Grundstoff':'Entdeckt'} · ∞</small></span><ChevronRight size={14}/></button>)}</div><div className="infinite"><strong>∞</strong><span><b>Unendlicher Vorrat</b><small>Alles Entdeckte bleibt verfügbar.</small></span></div></aside><main><div className="heading"><div><div className="overline">DIE INFINITY-KI IST BEREIT</div><h2>Was entsteht, wenn du verbindest?</h2><p>Kombiniere zwei Elemente – die Infinity-KI findet für jede Verbindung eine eigene Form.</p></div><button className="reset" onClick={reset}><RotateCcw size={14}/> Leeren</button></div>{help&&<div className="help"><CircleHelp size={16}/><span>Jede Kombination hat genau ein Ergebnis. Das Rezept wird lokal gespeichert und ändert sich nie.</span></div>}<section className="forge canvas" onDragOver={allowDrop}><div className="grid"/><div className="canvas-label"><span>CANVAS</span><small>Elemente hierher ziehen</small></div><div className="slots"><div onDrop={event=>dropElement(event,0)} onDragOver={allowDrop}><Slot item={all.find(x=>x.id===picked[0])} clear={()=>setPicked(picked.slice(1))}/></div><b>+</b><div onDrop={event=>dropElement(event,1)} onDragOver={allowDrop}><Slot item={all.find(x=>x.id===picked[1])} clear={()=>setPicked([picked[0]])}/></div></div><button className={picked.length>0?'combine ready':'combine'} disabled={picked.length===0} onClick={picked.length===1?makeProperty:combine}><BrainCircuit size={17}/>{picked.length===1?'Eigenschaft erzeugen':'KI kombinieren'}</button><p>{message}</p></section><div className="recent"><div><div className="overline">DEINE ENTDECKUNGEN</div><h3>{found.length} neue Formen gefunden</h3></div><div className="cards">{found.length?found.slice().reverse().map(x=><button className={active===x.id?'card active':'card'} onClick={()=>setActive(x.id)} key={x.id}><span style={{color:x.color}}>{x.glyph}</span><b>{x.name}</b><small>{x.desc}</small></button>):<div className="empty">Noch keine Entdeckungen. Die erste wartet auf dich.</div>}</div></div></main><aside className="details"><div className="overline">ELEMENT-DETAILS</div><div className="art" style={{'--color':current.color} as CSSProperties}><span>{current.glyph}</span></div><label>{current.base?'GRUNDSTOFF':'ENTDECKT'}</label><h2>{current.name}</h2><p>{current.desc}</p><hr/><div className="meta"><span>VORRAT<strong>∞ Unbegrenzt</strong></span><span>STATUS<strong>● Gesichert</strong></span></div>{!current.base&&<div className="recipe"><div className="overline">ENTSTANDEN AUS</div><b>Eine eindeutige, unveränderliche Verbindung</b></div>}<button className="clear" onClick={clear}>Spielstand zurücksetzen</button></aside></div><footer>INFINITYCRAFT <span>·</span> Eine Welt aus Möglichkeiten</footer></div>
}
function Slot({item,clear}:{item?:Element;clear:()=>void}){return <div className={item?'slot filled':'slot'}>{item?<><button className="x" onClick={clear}>×</button><i style={{color:item.color}}>{item.glyph}</i><b>{item.name}</b><small>∞ verfügbar</small></>:<><strong>+</strong><small>Element auswählen</small></>}</div>}
