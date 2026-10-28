(function(root){
  function advance(position,output){
    if(!['00','10','01'].includes(output))throw new Error('Motor no válido: usa 00 parado, 10 abrir o 01 cerrar.');
    return Math.max(0,Math.min(100,position+(output==='10'?5:output==='01'?-5:0)));
  }
  // People wait in the detection zone until the door is completely open.
  // Their passage lasts twelve simulation steps; the detector stays active.
  function movePeople(people,position){return people.map(person=>({...person,progress:position===100?person.progress+1:person.progress})).filter(person=>person.progress<12);}
  function sensors(position,people){return `${Number(people.length>0)}${Number(position===100)}${Number(position===0)}`;}
  const api={advance,movePeople,sensors};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DoorFSM=api;
})(globalThis);
