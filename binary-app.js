(() => {
 const $=id=>document.getElementById(id), {limit,decimal,binary,encode}=UnsignedBinary;
 let mode='decode',value=0,correct=0,attempts=0,graded=false;
 const width=()=>Number($('bits').value);
 function feedback(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=String(error);}
 function score(){ $('score').textContent=`${correct} / ${attempts} aciertos`; }
 function exercise(n){value=n;graded=false;$('source').textContent=mode==='decode'?encode(n,width()):n;$('source-base').textContent=mode==='decode'?'₂':'₁₀';$('source-label').textContent=mode==='decode'?'BINARIO · BASE 2':'DECIMAL · BASE 10';$('exercise-title').textContent=mode==='decode'?'Convierte a decimal':'Convierte a binario';$('answer-label').textContent=mode==='decode'?'Tu respuesta en decimal':'Tu respuesta en binario';$('answer-help').textContent=mode==='decode'?`Introduce un entero entre 0 y ${limit(width())}.`:`Introduce hasta ${width()} bits. Puedes omitir los ceros a la izquierda.`;
 $('range').textContent=`${width()} bits: de 0 a ${limit(width())} = 2^${width()} − 1.`;
 $('answer').value='';$('answer').removeAttribute('aria-invalid');$('explanation').hidden=true;feedback('');}
 function next(){exercise(Math.floor(Math.random()*(limit(width())+1)));}
 function explain(){const bits=encode(value,width());$('weights').style.setProperty('--bits',width());$('weights').replaceChildren(...[...bits].map((bit,i)=>{const cell=document.createElement('div');cell.className=bit==='1'?'on':'';const power=document.createElement('span');power.textContent=`2^${width()-i-1}`;const weight=document.createElement('small');weight.textContent=2**(width()-i-1);const digit=document.createElement('strong');digit.textContent=bit;cell.append(power,weight,digit);return cell;}));const terms=[...bits].flatMap((bit,i)=>bit==='1'?[2**(width()-i-1)]:[]);$('sum').textContent=`${bits}₂ = ${terms.length?terms.join(' + '):'0'} = ${value}₁₀`;$('explanation').hidden=false;}
 $('answer-form').onsubmit=event=>{event.preventDefault();try{const answer=mode==='decode'?decimal($('answer').value,width()):binary($('answer').value,width());const ok=answer===value;if(!graded){attempts++;if(ok)correct++;graded=true;score();}$('answer').setAttribute('aria-invalid',String(!ok));feedback(ok?'Correcto. Ambas representaciones tienen el mismo valor.':'Todavía no coincide. Revisa los pesos de los bits o consulta la solución.',!ok);if(ok)explain();}catch(e){$('answer').setAttribute('aria-invalid','true');feedback(e.message,true);}};
 $('solution').onclick=()=>{if(!graded){attempts++;graded=true;score();}explain();feedback(`Solución: ${encode(value,width())}₂ = ${value}₁₀.`);};
 $('new').onclick=()=>{next();$('answer').focus();};$('bits').onchange=next;
 document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(el=>{const active=el===button;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});next();});
 $('use-custom').onclick=()=>{try{exercise(decimal($('custom').value,width()));}catch(e){feedback(e.message,true);}};
 next();
})();
