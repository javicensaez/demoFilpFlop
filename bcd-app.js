(() => {
 const $=id=>document.getElementById(id), {limit,decimal,binary,encode}=BCD8421;
 let mode='decode',value=0,correct=0,attempts=0,graded=false;
 const width=()=>Number($('bits').value);
 function feedback(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=String(error);}
 function score(){ $('score').textContent=`${correct} / ${attempts} aciertos`; }
 function exercise(n){value=n;graded=false;$('source').textContent=mode==='decode'?encode(n,width()):n;$('source-base').textContent=mode==='decode'?' BCD':'₁₀';$('source-label').textContent=mode==='decode'?'BCD 8421':'DECIMAL · BASE 10';$('exercise-title').textContent=mode==='decode'?'Convierte a decimal':'Convierte a BCD';$('answer-label').textContent=mode==='decode'?'Tu respuesta en decimal':'Tu respuesta en BCD';$('answer-help').textContent=mode==='decode'?`Introduce un entero entre 0 y ${limit(width())}.`:`Introduce ${width()} grupos de 4 bits. Puedes separarlos con espacios; completa las cifras iniciales con 0000.`;
 $('range').textContent=`${width()} cifras · ${width()*4} bits BCD: de 0 a ${limit(width())}.`;
 $('answer').value='';$('answer').removeAttribute('aria-invalid');$('explanation').hidden=true;feedback('');}
 function next(){exercise(Math.floor(Math.random()*(limit(width())+1)));}
 function explain(){const groups=encode(value,width()).split(' ');$('weights').replaceChildren(...groups.map(group=>{const card=document.createElement('div');card.className='bcd-digit';const label=document.createElement('strong');label.textContent=`Cifra ${parseInt(group,2)}`;const row=document.createElement('div');row.className='bcd-bits';[...group].forEach((bit,i)=>{const cell=document.createElement('div');cell.className=bit==='1'?'on':'';const weight=document.createElement('small');weight.textContent=[8,4,2,1][i];const digit=document.createElement('strong');digit.textContent=bit;cell.append(weight,digit);row.append(cell);});card.append(label,row);return card;}));$('sum').textContent=groups.map(group=>`${group} → ${parseInt(group,2)}`).join(' · ')+` ⇒ ${value} en decimal`;$('explanation').hidden=false;}
 $('answer-form').onsubmit=event=>{event.preventDefault();try{const answer=mode==='decode'?decimal($('answer').value,width()):binary($('answer').value,width());const ok=answer===value;if(!graded){attempts++;if(ok)correct++;graded=true;score();}$('answer').setAttribute('aria-invalid',String(!ok));feedback(ok?'Correcto. Ambas representaciones tienen el mismo valor.':'Todavía no coincide. Revisa los grupos de cuatro bits o consulta la solución.',!ok);if(ok)explain();}catch(e){$('answer').setAttribute('aria-invalid','true');feedback(e.message,true);}};
 $('solution').onclick=()=>{if(!graded){attempts++;graded=true;score();}explain();feedback(`Solución: ${encode(value,width())} (BCD) = ${value}₁₀.`);};
 $('new').onclick=()=>{next();$('answer').focus();};$('bits').onchange=next;
 document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(el=>{const active=el===button;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});next();});
 $('use-custom').onclick=()=>{try{exercise(decimal($('custom').value,width()));}catch(e){feedback(e.message,true);}};
 next();
})();
