// Gara SET di squadra · server minimo (solo Node.js, nessuna libreria).
// Avvio: node server.js   poi apri http://localhost:3000 su ogni dispositivo (stessa rete) o mettilo online (es. Render).
// Le regole sono lette dalla pagina stessa (blocco REGOLE-INIZIO … REGOLE-FINE), quindi pagina e server non divergono.
const http=require('http'),fs=require('fs'),path=require('path'),vm=require('vm');
const PAGE=path.join(__dirname,'gara-semifinale.html'), RESULTS=path.join(__dirname,'risultati.json'), PORT=process.env.PORT||3000;
const src=fs.readFileSync(PAGE,'utf8');
const rules=src.slice(src.indexOf('/* REGOLE-INIZIO'),src.indexOf('/* REGOLE-FINE */'));
const R=vm.createContext({structuredClone});vm.runInContext(rules+';this.reduce=reduce;this.resultOf=resultOf;',R);
const html='<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+src+'</body></html>';

let results=[];try{results=JSON.parse(fs.readFileSync(RESULTS,'utf8'))}catch{}
const teams=new Map(); // squadra -> {state, clients:Map(id->{res,name,sel})}
const T=t=>{if(!teams.has(t))teams.set(t,{state:null,clients:new Map()});return teams.get(t)};
const send=(res,ev,data)=>res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
const broadcast=(t,ev,data)=>{for(const c of T(t).clients.values())send(c.res,ev,data)};
const peersOf=t=>[...T(t).clients].map(([id,c])=>({id,name:c.name,sel:c.sel}));
const resultsOf=t=>results.filter(r=>r.squadra===t).sort((a,b)=>b.finishedAt-a.finishedAt).slice(0,50);
function act(t,a){
  const tm=T(t),r=R.reduce(tm.state?structuredClone(tm.state):null,a,Date.now());
  if(r&&r.s){tm.state=r.s;broadcast(t,'state',tm.state)}
  if(r&&r.ended){results.push(R.resultOf(r.s,t));fs.writeFile(RESULTS,JSON.stringify(results),()=>{});broadcast(t,'results',resultsOf(t))}
  return r||{};
}
setInterval(()=>{for(const [t,tm] of teams)if(tm.state?.status==='running'&&Date.now()>=tm.state.endsAt)act(t,{type:'end',outcome:'completata',text:'Tempo scaduto'})},250);

http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x');
  if(u.pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});return res.end(html)}
  if(u.pathname==='/api/ping')return res.end('ok');
  if(u.pathname==='/api/events'){
    const t=String(u.searchParams.get('team')||'1').slice(0,20),id=String(u.searchParams.get('id')||'').slice(0,20),name=String(u.searchParams.get('name')||'').slice(0,16);
    res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache',connection:'keep-alive'});
    T(t).clients.set(id,{res,name,sel:[]});
    send(res,'state',T(t).state);send(res,'results',resultsOf(t));broadcast(t,'peers',peersOf(t));
    const ka=setInterval(()=>res.write(': ka\n\n'),20000);
    req.on('close',()=>{clearInterval(ka);T(t).clients.delete(id);broadcast(t,'peers',peersOf(t))});
    return;
  }
  if(u.pathname==='/api/act'&&req.method==='POST'){
    let body='';req.on('data',d=>{body+=d;if(body.length>4000)req.destroy()});
    req.on('end',()=>{
      let b;try{b=JSON.parse(body)}catch{res.writeHead(400);return res.end('{}')}
      const t=String(b.team||'1').slice(0,20),c=T(t).clients.get(b.id);
      if(Array.isArray(b.sel)){if(c){c.sel=b.sel.slice(0,3).map(String);broadcast(t,'peers',peersOf(t))}return res.end('{}')}
      const a=b.action||{};if(a.who)a.who=String(a.who).slice(0,16);
      const r=act(t,a);res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({err:r.err||null}));
    });return;
  }
  res.writeHead(404);res.end();
}).listen(PORT,()=>console.log('Gara SET di squadra su http://localhost:'+PORT));
