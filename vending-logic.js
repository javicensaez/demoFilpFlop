(function(root){
 const coins={'000':0,'100':200,'010':100,'001':50};
 function step(machine,state,input){
  if(!Object.hasOwn(coins,input))throw new Error('Solo se permite una moneda por paso: 000, 100, 010 o 001.');
  const engine=typeof module!=='undefined'&&module.exports?require('./wiper-logic.js'):root.WiperFSM;
  const result=engine.step(machine,state,input);
  return {...result,inserted:coins[input],cans:Number(result.output[0]),change:Number(result.output[1])*100+Number(result.output[2])*50};
 }
 const api={step};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.VendingFSM=api;
})(globalThis);
