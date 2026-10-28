const BULB_EXAMPLE_2 = "digraph Bombilla {\n  inicio [shape=point];\n  inicio -> APA_NP;\n  APA_NP [label=\"APA_NP\\n0\"];\n  APA_P [label=\"APA_P\\n1\"];\n  ENC_NP [label=\"ENC_NP\\n1\"];\n  ENC_P [label=\"ENC_P\\n0\"];\n\n  APA_NP -> APA_NP [label=\"0\"];\n  APA_NP -> APA_P [label=\"1\"];\n  APA_P -> APA_P [label=\"1\"];\n  APA_P -> ENC_NP [label=\"0\"];\n  ENC_NP -> ENC_NP [label=\"0\"];\n  ENC_NP -> ENC_P [label=\"1\"];\n  ENC_P -> ENC_P [label=\"1\"];\n  ENC_P -> APA_NP [label=\"0\"];\n}\n";
const BULB_EXAMPLE = "digraph Bombilla {\n  inicio [shape=point];\n  inicio -> APAGADA;\n  APAGADA [label=\"APAGADA\\n0\"];\n  ENCENDIDA [label=\"ENCENDIDA\\n1\"];\n  APAGADA -> APAGADA [label=\"0\"];\n  APAGADA -> ENCENDIDA [label=\"1\"];\n  ENCENDIDA -> APAGADA [label=\"0\"];\n  ENCENDIDA -> ENCENDIDA [label=\"1\"];\n}\n";
(() => {
  const $=id=>document.getElementById(id); let machine, state, pressed=false, timer=null, last=null, count=0;
  function message(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=error;}
  function stop(){clearInterval(timer);timer=null;$('simulate').textContent='Simular';$('simulate').setAttribute('aria-pressed','false');}
  function input(){return String(Number(pressed || $('button').checked));}
  const ns='http://www.w3.org/2000/svg';
  function svg(tag,attrs={},text){const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
  function graph(){
    const names=[...machine.outputs.keys()], n=names.length, radius=Math.max(150,n*40), size=radius*2+240, center=size/2;
    const canvas=svg('svg',{viewBox:`0 0 ${size} ${size}`,role:'img','aria-label':'Máquina de estados del DOT aplicado'});
    const defs=svg('defs'),marker=svg('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(svg('path',{d:'M0 0 L10 5 L0 10 Z',fill:'context-stroke'}));defs.append(marker);canvas.append(defs);
    const points=new Map(names.map((name,i)=>[name,{x:center+radius*Math.cos(i*2*Math.PI/n-Math.PI/2),y:center+radius*Math.sin(i*2*Math.PI/n-Math.PI/2)}]));
    machine.transitions.forEach((edge,index)=>{
      const a=points.get(edge.from),b=points.get(edge.to),g=svg('g',{'data-edge':index});let d,tx,ty;
      if(edge.from===edge.to){d=`M ${a.x-28} ${a.y-35} C ${a.x-110} ${a.y-135}, ${a.x+110} ${a.y-135}, ${a.x+28} ${a.y-35}`;tx=a.x;ty=a.y-105;}
      else{const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;const parallel=machine.transitions.slice(0,index).filter(e=>e.from===edge.from&&e.to===edge.to).length;const bend=35+parallel*30;tx=(a.x+b.x)/2-uy*bend;ty=(a.y+b.y)/2+ux*bend;d=`M ${a.x+ux*49} ${a.y+uy*49} Q ${tx} ${ty} ${b.x-ux*52} ${b.y-uy*52}`;}
      g.append(svg('path',{d,fill:'none',stroke:'#9bafa4','marker-end':'url(#arrow)'}),svg('text',{x:tx,y:ty-6,'text-anchor':'middle',stroke:'white','stroke-width':4,'paint-order':'stroke'},edge.label));canvas.append(g);
    });
    names.forEach(name=>{const p=points.get(name),g=svg('g',{'data-state':name});g.append(svg('circle',{cx:p.x,cy:p.y,r:48,fill:'white',stroke:'#9bafa4','stroke-width':2}));if(name===machine.initial)g.append(svg('circle',{cx:p.x,cy:p.y,r:43,fill:'none',stroke:'#9bafa4'}));g.append(svg('text',{x:p.x,y:p.y-5,'text-anchor':'middle'},name),svg('text',{x:p.x,y:p.y+18,'text-anchor':'middle'},machine.outputs.get(name)));canvas.append(g);});$('graph').replaceChildren(canvas);
  }
  function render(){if(!machine)return;const output=machine.outputs.get(state);$('state').textContent=state;$('output').textContent=output;$('input').textContent=input();$('bulb').classList.toggle('on',output==='1');$('bulb').setAttribute('aria-label',output==='1'?'Bombilla encendida':'Bombilla apagada');$('motion').textContent=output==='1'?'Bombilla encendida':'Bombilla apagada';$('press').setAttribute('aria-pressed',String(input()==='1'));$('press').textContent=`Mantener pulsado · ${input()}`;document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('active',el.dataset.state===state));document.querySelectorAll('[data-edge]').forEach(el=>el.classList.toggle('last',machine.transitions[Number(el.dataset.edge)]===last));}
  function reset(){stop();state=$('initial').value;pressed=false;last=null;count=0;$('history').replaceChildren();$('button').checked=false;render();message('Pulsa Simular y mantén el pulsador para encender la bombilla.');}
  function load(){stop();try{const parsed=WiperFSM.parse($('dot').value,{inputBits:1,outputBits:1});machine=parsed;$('initial').replaceChildren(...[...machine.outputs.keys()].map(name=>new Option(name,name)));$('initial').value=machine.initial;graph();reset();$('dot').dataset.dirty='false';$('simulate').disabled=false;$('step').disabled=false;message('DOT aplicado. La simulación ejecutará esta máquina.');}catch(e){$('simulate').disabled=true;$('step').disabled=true;message(e.message,true);}}
  function tick(){try{const bits=input(),from=state,result=WiperFSM.step(machine,state,bits);state=result.state;last=result.edge;const row=document.createElement('tr');[++count,from,bits,state,result.output].forEach(v=>{const cell=document.createElement('td');cell.textContent=v;row.append(cell);});$('history').prepend(row);if($('history').children.length>30)$('history').lastChild.remove();render();message(`${from} —${bits}→ ${state}`);}catch(e){stop();message(`${e.message} Simulación pausada.`,true);}}
  $('example-2').onclick=()=>{$('dot').value=BULB_EXAMPLE_2;load();};
  $('load').onclick=load;$('example').onclick=()=>{$('dot').value=BULB_EXAMPLE;load();};$('dot').oninput=()=>{stop();$('simulate').disabled=true;$('step').disabled=true;message('Código modificado: pulsa Aplicar DOT para actualizar el diagrama y la simulación.');};
  $('simulate').onclick=()=>{if(timer){stop();return;}tick();if($('feedback').dataset.error==='true')return;timer=setInterval(tick,120);$('simulate').textContent='Pausar';$('simulate').setAttribute('aria-pressed','true');};$('step').onclick=()=>{stop();tick();};$('reset').onclick=reset;$('initial').onchange=reset;
  $('button').onchange=render;
  const press=$('press');
  press.onpointerdown=e=>{press.setPointerCapture(e.pointerId);pressed=true;render();};
  function release(){pressed=false;render();}
  press.onpointerup=release;press.onpointercancel=release;press.onlostpointercapture=release;
  press.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();pressed=true;render();}};
  press.onkeyup=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();release();}};
  press.onblur=release;window.addEventListener('blur',release);
  $('file').onchange=async()=>{const file=$('file').files[0];if(file){$('dot').value=await file.text();load();}};
  $('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$('dot').value],{type:'text/vnd.graphviz'}));const a=document.createElement('a');a.href=url;a.download='bombilla.dot';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};window.addEventListener('pagehide',stop);$('dot').value=BULB_EXAMPLE;load();
})();
