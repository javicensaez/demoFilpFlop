const VENDING_EXAMPLE = "digraph Expendedora {\n  inicio [shape=point];\n  inicio -> SALDO_0;\n  SALDO_0 [label=\"SALDO_0\\n000\"];\n  SALDO_050 [label=\"SALDO_050\\n000\"];\n  SALDO_1 [label=\"SALDO_1\\n000\"];\n  LATA [label=\"LATA\\n100\"];\n  CAMBIO_050 [label=\"CAMBIO_050\\n101\"];\n  CAMBIO_1 [label=\"CAMBIO_1\\n110\"];\n  CAMBIO_150 [label=\"CAMBIO_150\\n111\"];\n  SALDO_0 -> SALDO_0 [label=\"000\"];\n  SALDO_0 -> CAMBIO_050 [label=\"100\"];\n  SALDO_0 -> SALDO_1 [label=\"010\"];\n  SALDO_0 -> SALDO_050 [label=\"001\"];\n  SALDO_050 -> SALDO_050 [label=\"000\"];\n  SALDO_050 -> CAMBIO_1 [label=\"100\"];\n  SALDO_050 -> LATA [label=\"010\"];\n  SALDO_050 -> SALDO_1 [label=\"001\"];\n  SALDO_1 -> SALDO_1 [label=\"000\"];\n  SALDO_1 -> CAMBIO_150 [label=\"100\"];\n  SALDO_1 -> CAMBIO_050 [label=\"010\"];\n  SALDO_1 -> LATA [label=\"001\"];\n  LATA -> SALDO_0 [label=\"000\"];\n  CAMBIO_050 -> SALDO_0 [label=\"000\"];\n  CAMBIO_1 -> SALDO_0 [label=\"000\"];\n  CAMBIO_150 -> SALDO_0 [label=\"000\"];\n}\n";
(() => {
 const $=id=>document.getElementById(id);
 let machine,state,timer=null,last=null,pending='000',count=0,inserted=0,cans=0,change=0,dirty=false;
 const money=value=>`${(value/100).toFixed(2).replace('.',',')} €`;
 function message(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=String(error);}
 function stop(){clearInterval(timer);timer=null;$('simulate').textContent='Simular';$('simulate').setAttribute('aria-pressed','false');}
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


 function render(){if(!machine)return;const output=machine.outputs.get(state);$('state').textContent=state;$('input').textContent=pending;$('output').textContent=output;$('inserted').textContent=money(inserted);$('cans').textContent=cans;$('change').textContent=money(change);['can','euro','half'].forEach((id,i)=>{$(id).classList.toggle('on',output[i]==='1');$(id).querySelector('output').textContent=output[i];});
  ['100','010','001'].forEach(bits=>$('coin-'+bits).disabled=dirty||pending!=='000'||output!=='000');
  document.querySelectorAll('[data-state]').forEach(el=>el.classList.toggle('active',el.dataset.state===state));document.querySelectorAll('[data-edge]').forEach(el=>el.classList.toggle('last',machine.transitions[Number(el.dataset.edge)]===last));
 }
 function reset(){stop();if(!machine)return;state=$('initial').value;pending='000';count=0;inserted=0;cans=0;change=0;last=null;$('history').replaceChildren();render();message('Introduce una moneda y pulsa Un paso o Simular.');}
 function load(){stop();try{machine=WiperFSM.parse($('dot').value,{inputBits:3,outputBits:3});dirty=false;$('initial').replaceChildren(...[...machine.outputs.keys()].map(name=>new Option(name,name)));$('initial').value=machine.initial;graph();reset();$('simulate').disabled=false;$('step').disabled=false;message('DOT aplicado. Precio del ejemplo: 1,50 €.');}catch(e){dirty=true;$('simulate').disabled=true;$('step').disabled=true;render();message(e.message,true);}}
 function tick(){try{const input=pending,from=state,result=VendingFSM.step(machine,state,input);state=result.state;last=result.edge;pending='000';inserted+=result.inserted;cans+=result.cans;change+=result.change;
  const row=document.createElement('tr');[++count,from,input,state,result.output,result.cans,money(result.change)].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});$('history').prepend(row);if($('history').children.length>30)$('history').lastChild.remove();render();message(`${from} —${input}→ ${state}.${result.cans?' Entrega una lata.':''}${result.change?` Devuelve ${money(result.change)}.`:''}`);
 }catch(e){stop();message(e.message,true);}}
 $('load').onclick=load;$('example').onclick=()=>{$('dot').value=VENDING_EXAMPLE;load();};$('dot').oninput=()=>{stop();dirty=true;$('simulate').disabled=true;$('step').disabled=true;render();message('Pulsa Aplicar DOT para ejecutar el código modificado.');};
 ['100','010','001'].forEach(bits=>$('coin-'+bits).onclick=()=>{pending=bits;render();message(`Moneda preparada: entrada ${bits}. Se consume en el próximo paso.`);});
 $('simulate').onclick=()=>{if(timer){stop();return;}tick();if($('feedback').dataset.error==='true')return;timer=setInterval(tick,700);$('simulate').textContent='Pausar';$('simulate').setAttribute('aria-pressed','true');};$('step').onclick=()=>{stop();tick();};$('reset').onclick=reset;$('initial').onchange=reset;
 $('file').onchange=async()=>{const file=$('file').files[0];if(file){$('dot').value=await file.text();load();}};
 $('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$('dot').value],{type:'text/vnd.graphviz'}));const a=document.createElement('a');a.href=url;a.download='expendedora.dot';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};window.addEventListener('pagehide',stop);$('dot').value=VENDING_EXAMPLE;load();
})();
