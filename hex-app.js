(() => {
 const $=id=>document.getElementById(id), {limit,decimal,hexadecimal,encode,binary,encodeBinary}=Hexadecimal;
 let mode='decode',value=0,correct=0,attempts=0,graded=false;
 const width=()=>Number($('bits').value);
 function feedback(text,error=false){$('feedback').textContent=text;$('feedback').dataset.error=String(error);}
 function score(){ $('score').textContent=`${correct} / ${attempts} aciertos`; }
 const modes={decode:{source:'hexadecimal',target:'decimal'},encode:{source:'decimal',target:'hexadecimal'},'binary-hexadecimal':{source:'binary',target:'hexadecimal'},'hexadecimal-binary':{source:'hexadecimal',target:'binary'}};
 const names={decimal:'decimal',hexadecimal:'hexadecimal',binary:'binario'};
 const formats={decimal:n=>String(n),hexadecimal:n=>encode(n,width()),binary:n=>encodeBinary(n,width())};
 const bases={decimal:'₁₀',hexadecimal:'₁₆',binary:'₂'};
 function exercise(n){value=n;graded=false;const {source,target}=modes[mode];$('source').textContent=formats[source](n);$('source-base').textContent=bases[source];$('source-label').textContent=`${names[source].toUpperCase()} · BASE ${source==='decimal'?10:source==='hexadecimal'?16:2}`;$('exercise-title').textContent=`Convierte a ${names[target]}`;$('answer-label').textContent=`Tu respuesta en ${names[target]}`;$('answer-help').textContent=target==='decimal'?`Introduce un entero entre 0 y ${limit(width())}.`:target==='binary'?`Introduce hasta ${width()*4} bits. Puedes agruparlos de cuatro en cuatro con espacios y omitir ceros iniciales.`:`Introduce hasta ${width()} dígitos hexadecimales (0–9 y A–F, sin prefijo 0x). Puedes omitir ceros iniciales.`;
 $('range').textContent=`${width()} dígitos hexadecimales ↔ ${width()*4} bits. De 0 a ${limit(width())} en decimal.`;
 $('answer').value='';$('answer').removeAttribute('aria-invalid');$('explanation').hidden=true;feedback('');}
 function next(){exercise(Math.floor(Math.random()*(limit(width())+1)));}
 function explain(){const oct=encode(value,width());
 if(mode==='binary-hexadecimal'||mode==='hexadecimal-binary'){
  const groups=encodeBinary(value,width()).split(' ');$('weights').style.setProperty('--bits',width());$('weights').replaceChildren(...groups.map((group,i)=>{const cell=document.createElement('div');cell.className='on';const bits=document.createElement('strong');bits.textContent=group;const digit=document.createElement('span');digit.textContent=`↕ ${oct[i]}₁₆`;cell.append(bits,digit);return cell;}));$('sum').textContent=`${encodeBinary(value,width())}₂ = ${oct}₁₆`;$('division').textContent='Agrupa los bits de cuatro en cuatro desde la derecha. Completa el grupo de la izquierda con ceros si hace falta. Cada grupo se convierte en un dígito de 0 a 15 (0–9, A–F); para volver a binario, sustituye cada dígito por sus cuatro bits.';$('explanation').hidden=false;return;
 }
$('weights').style.setProperty('--bits',width());$('weights').replaceChildren(...[...oct].map((digit,i)=>{const cell=document.createElement('div');cell.className=digit!=='0'?'on':'';const power=document.createElement('span');power.textContent=`16^${width()-i-1}`;const weight=document.createElement('small');weight.textContent=16**(width()-i-1);const d=document.createElement('strong');d.textContent=digit;cell.append(power,weight,d);return cell;}));const terms=[...oct].flatMap((digit,i)=>digit!=='0'?[`${parseInt(digit,16)} × ${16**(width()-i-1)}`]:[]);$('sum').textContent=`${oct}₁₆ = ${terms.length?terms.join(' + '):'0'} = ${value}₁₀`;
 let remaining=value;const divisions=[];do{divisions.push(`${remaining} ÷ 16 = ${Math.floor(remaining/16)}, resto ${remaining%16}`);remaining=Math.floor(remaining/16);}while(remaining>0);$('division').textContent=divisions.join(' · ')+`. Lee los restos del último al primero: ${value.toString(16).toUpperCase()}₁₆.`;$('explanation').hidden=false;}
 $('answer-form').onsubmit=event=>{event.preventDefault();try{const parsers={decimal,hexadecimal,binary};const answer=parsers[modes[mode].target]($('answer').value,width());const ok=answer===value;if(!graded){attempts++;if(ok)correct++;graded=true;score();}$('answer').setAttribute('aria-invalid',String(!ok));feedback(ok?'Correcto. Ambas representaciones tienen el mismo valor.':'Todavía no coincide. Revisa los pesos de los dígitos hexadecimales o consulta la solución.',!ok);if(ok)explain();}catch(e){$('answer').setAttribute('aria-invalid','true');feedback(e.message,true);}};
 $('solution').onclick=()=>{if(!graded){attempts++;graded=true;score();}explain();const {source,target}=modes[mode];feedback(`Solución: ${formats[source](value)}${bases[source]} = ${formats[target](value)}${bases[target]}.`);};
 $('new').onclick=()=>{next();$('answer').focus();};$('bits').onchange=next;
 document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(el=>{const active=el===button;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});next();});
 $('use-custom').onclick=()=>{try{exercise(decimal($('custom').value,width()));}catch(e){feedback(e.message,true);}};
 next();
})();
