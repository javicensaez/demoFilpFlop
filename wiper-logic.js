(function(root) {
  function parse(source, {inputBits=3, outputBits=2}={}) {
    const tokens = source.match(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|->|[A-Za-z_\u0080-\uffff][\w\u0080-\uffff]*|\d+(?:\.\d+)?|[{}\[\]=;,]|\S/g) || [];
    let i=0; const states=new Map(), edges=[]; let initial=null;
    const fail=message=>{throw new Error(message);};
    const peek=()=>tokens[i];
    const take=()=>tokens[i++];
    const expect=value=>{if(take()!==value) fail(`Se esperaba «${value}».`);};
    const value=()=>{const t=take(); if(!t || !/^(?:"|[\w\u0080-\uffff])/.test(t)) fail('Identificador o valor no válido.'); return t.startsWith('"') ? t.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,'\\') : t;};
    // Comments are tokens so quoted URLs and comment-like labels remain intact.
    const clean=tokens.filter(t=>!t.startsWith('//')&&!t.startsWith('/*')&&!t.startsWith('#')); tokens.splice(0,tokens.length,...clean);
    if(take()!=='digraph') fail('El código debe comenzar con digraph.');
    if(peek()!=='{') value(); expect('{');
    function attrs(){const result={}; while(peek()==='['){take(); while(peek()!==']'){if(i>=tokens.length) fail('Falta cerrar los atributos.'); const k=value(); expect('='); result[k]=value(); if(peek()===','||peek()===';')take();} take();} return result;}
    function body(){while(peek()!=='}' && i<tokens.length){if(peek()===';'){take();continue;} if(peek()==='{'){take();body();expect('}');continue;}
      const id=value(); if(peek()==='='){take();value();} else if(peek()==='->'){take(); const to=value(), a=attrs(); edges.push({from:id,to,label:a.label});}
      else {const a=attrs(); if(!['node','edge','graph'].includes(id)) states.set(id,{...states.get(id),...a,id});}
      if(peek()===';')take();
    }} body(); expect('}'); if(i!==tokens.length)fail('Hay contenido después del cierre del grafo.');
    const points=new Set([...states.values()].filter(s=>s.shape==='point'||s.shape==='none').map(s=>s.id));
    const outputs=new Map();
    for(const s of states.values()) {if(points.has(s.id))continue; const label=(s.label||'').replace(/\\[nlr]/g,'\n'); const match=label.match(new RegExp(`(?:^|[\\s/])([01]{${outputBits}})\\s*$`)); if(!match)fail(`El estado ${s.id} debe tener una salida de ${outputBits===2?'dos bits':'un bit'} en una etiqueta como «${s.id}\\n${'0'.repeat(outputBits)}».`); outputs.set(s.id,match[1]);}
    if(!outputs.size)fail('Define al menos un estado con salida de dos bits.');
    const transitions=[];
    for(const e of edges){if(points.has(e.from)){if(initial)fail('Solo puede haber una flecha inicial.'); initial=e.to;continue;}
      if(!outputs.has(e.from)||!outputs.has(e.to))fail(`Estado sin declarar en ${e.from} → ${e.to}.`);
      if(!e.label)fail('Cada transición necesita una etiqueta de entrada.');
      const patterns=e.label.split(/[,;\s]+/).filter(Boolean); if(patterns.some(p=>!new RegExp(`^[01xX-]{${inputBits}}$`).test(p)))fail(`Etiqueta «${e.label}» no válida: usa ${inputBits===3?'tres bits':'un bit'}, con x para indiferente.`);
      transitions.push({...e,patterns});
    }
    if(initial&&!outputs.has(initial))fail('El estado inicial no está declarado.');
    const machine={outputs,transitions,inputBits,initial:initial||outputs.keys().next().value};
    for(const state of outputs.keys())for(let n=0;n<2**inputBits;n++){const input=n.toString(2).padStart(inputBits,'0'); if(matches(machine,state,input).length>1)fail(`Transiciones ambiguas desde ${state} con ${input}.`);}
    return machine;
  }
  function matches(m,state,input){return m.transitions.filter(e=>e.from===state&&e.patterns.some(p=>[...p].every((b,i)=>b==='x'||b==='X'||b==='-'||b===input[i])));}
  function step(m,state,input){if(!m.outputs.has(state)||!new RegExp(`^[01]{${m.inputBits||3}}$`).test(input))throw new Error('Estado o entrada no válidos.'); const edge=matches(m,state,input)[0]; if(!edge)throw new Error(`No hay transición desde ${state} con ${input}.`); return {state:edge.to,output:m.outputs.get(edge.to),edge};}
  function advance(position,output){return Math.max(0,Math.min(100,position+(output==='10'?-5:output==='01'?5:0)));}
  const api={parse,step,advance}; if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WiperFSM=api;
})(globalThis);
