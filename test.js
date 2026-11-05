// Controllo rapido delle regole: node test.js
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/gara-semifinale.html','utf8');
const R=vm.createContext({structuredClone});
vm.runInContext(src.slice(src.indexOf('/* REGOLE-INIZIO'),src.indexOf('/* REGOLE-FINE */'))+';this.reduce=reduce;this.setsOf=setsOf;this.FREE_BONUS=FREE_BONUS;',R);
const go=(s,a,now=Date.now())=>{const r=R.reduce(s,a,now);assert(!r.err,r.err);return r.s};
// gara: SET validi, bonus con penalità dal 6°, rimescolata a fine mazzo
let s=go(null,{type:'start'});
while(s.sets<40){const S=R.setsOf(s.board);s=S.length?go(s,{type:'set',ids:S[0],who:'A'}):go(s,{type:'bonus',who:'A'})}
assert.strictEqual(s.sets,40);assert(s.reshuffles>=1);
while(s.bonus<6)s=s.board.length<=18?go(s,{type:'bonus',who:'A'}):go(s,{type:'set',ids:R.setsOf(s.board)[0],who:'A'});
assert.strictEqual(s.bonus-R.FREE_BONUS,1);
s=go(s,{type:'end',outcome:'completata',text:'Fine'},s.endsAt);assert.strictEqual(s.status,'ended');
// quesiti: la soluzione mostrata supera sempre la verifica
for(const t of ['elimina','mancante','solitarie'])for(let i=0;i<20;i++){
  let q=go(null,{type:'q-new',qtype:t});q=go(q,{type:'q-sol'});q=go(q,{type:'q-check'});assert.strictEqual(q.q.res.kind,'ok',t+': '+q.q.res.text)}
let q=go(null,{type:'q-new',qtype:'trova'});for(const x of R.setsOf(q.q.table))q=go(q,{type:'q-find',ids:x,who:'A'});
assert.strictEqual(q.q.found.length,q.q.n);
console.log('Tutti i controlli sono passati.');
