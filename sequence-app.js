const SEQUENCE_EXAMPLE = "digraph Detector1011 {\n  inicio [shape=point];\n  inicio -> S0;\n  S0 [label=\"S0\\n0\"];\n  S1 [label=\"S1\\n0\"];\n  S2 [label=\"S2\\n0\"];\n  S3 [label=\"S3\\n0\"];\n  S4 [label=\"S4\\n1\"];\n  S0 -> S0 [label=\"0\"];\n  S0 -> S1 [label=\"1\"];\n  S1 -> S2 [label=\"0\"];\n  S1 -> S1 [label=\"1\"];\n  S2 -> S0 [label=\"0\"];\n  S2 -> S3 [label=\"1\"];\n  S3 -> S2 [label=\"0\"];\n  S3 -> S4 [label=\"1\"];\n  S4 -> S2 [label=\"0\"];\n  S4 -> S1 [label=\"1\"];\n}\n";
(() => {
  const $=id=>document.getElementById(id);
  let machine,state,timer=null,last=null,cursor=0,detections=0,events=[];
  function message(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=String(error);}
  function stop(){clearInterval(timer);timer=null;$('simulate').textContent='Simular secuencia';$('simulate').setAttribute('aria-pressed','false');}
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

  function render(){
    if(!machine)return;
    const output=machine.outputs.get(state), sequence=$('sequence').value;
    $('state').textContent=state;$('output').textContent=output;$('input').textContent=cursor<sequence.length?sequence[cursor]:'—';$('detections').textContent=detections;
    $('detected').classList.toggle('on',output==='1');$('detected').textContent=output==='1'?'Salida 1 · detección':'Salida 0 · esperando';
    $('progress').textContent=`${cursor} / ${sequence.length} bits leídos`;
    $('tape').replaceChildren(...[...sequence].map((bit,i)=>{const cell=document.createElement('span');cell.textContent=bit;cell.className=i<cursor?'read':'';if(i===cursor)cell.classList.add('next');if(events[i]?.output==='1')cell.classList.add('hit');cell.title=`Bit ${i+1}${events[i]?` · salida ${events[i].output}`:''}`;return cell;}));
    document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('active',el.dataset.state===state));document.querySelectorAll('[data-edge]').forEach(el=>el.classList.toggle('last',machine.transitions[Number(el.dataset.edge)]===last));
  }
  function reset(){stop();if(!machine)return;state=$('initial').value;last=null;cursor=0;detections=0;events=[];$('history').replaceChildren();render();message('Preparado: cada paso consume exactamente un bit.');}
  function load(){stop();try{const parsed=WiperFSM.parse($('dot').value,{inputBits:1,outputBits:1});machine=parsed;$('initial').replaceChildren(...[...machine.outputs.keys()].map(name=>new Option(name,name)));$('initial').value=machine.initial;graph();reset();['simulate','step','bit-0','bit-1'].forEach(id=>$(id).disabled=false);message('DOT aplicado. La salida depende solo del estado alcanzado.');}catch(e){['simulate','step','bit-0','bit-1'].forEach(id=>$(id).disabled=true);message(e.message,true);}}
  function tick(){
    const sequence=$('sequence').value;
    if(!/^[01]*$/.test(sequence)){stop();message('La secuencia solo puede contener 0 y 1.',true);return;}
    if(cursor>=sequence.length){stop();message('Secuencia terminada. Añade bits o reinicia para repetir.');return;}
    try{const input=sequence[cursor],from=state,result=WiperFSM.step(machine,state,input);state=result.state;last=result.edge;events.push(result);cursor++;if(result.output==='1')detections++;
      const row=document.createElement('tr');[cursor,from,input,state,result.output].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});if(result.output==='1')row.className='sequence-hit';$('history').prepend(row);if($('history').children.length>50)$('history').lastChild.remove();render();message(`Bit ${cursor}: ${from} —${input}→ ${state}. Salida ${result.output}.${result.output==='1'?' Detección.':''}`);if(cursor===sequence.length)stop();
    }catch(e){stop();message(e.message,true);}
  }
  $('load').onclick=load;$('example').onclick=()=>{$('dot').value=SEQUENCE_EXAMPLE;load();};
  $('dot').oninput=()=>{stop();['simulate','step','bit-0','bit-1'].forEach(id=>$(id).disabled=true);message('Pulsa Aplicar DOT para ejecutar el código modificado.');};
  $('sequence').oninput=()=>{reset();if(!/^[01]*$/.test($('sequence').value))message('Introduce solamente 0 y 1.',true);};
  $('test-overlap').onclick=()=>{$('sequence').value='1011011';reset();};
  $('simulate').onclick=()=>{if(timer){stop();return;}tick();if($('feedback').dataset.error==='true'||cursor>=$('sequence').value.length)return;timer=setInterval(tick,700);$('simulate').textContent='Pausar';$('simulate').setAttribute('aria-pressed','true');};
  $('step').onclick=()=>{stop();tick();};$('reset').onclick=reset;$('initial').onchange=reset;
  [0,1].forEach(bit=>$(`bit-${bit}`).onclick=()=>{stop();if(!/^[01]*$/.test($('sequence').value)){message('Corrige la secuencia antes de enviar bits.',true);return;}$('sequence').value=$('sequence').value.slice(0,cursor)+bit;tick();});
  $('file').onchange=async()=>{const file=$('file').files[0];if(file){$('dot').value=await file.text();load();}};
  $('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$('dot').value],{type:'text/vnd.graphviz'}));const a=document.createElement('a');a.href=url;a.download='secuencia-1011.dot';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  window.addEventListener('pagehide',stop);$('dot').value=SEQUENCE_EXAMPLE;load();
})();
