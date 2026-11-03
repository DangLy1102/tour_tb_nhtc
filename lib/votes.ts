import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const KEY='nhtc_tour_votes';
const file=path.join(process.cwd(),'data','votes.json');
export type Votes=Record<string,string>;

export class VoteStoreError extends Error{
 constructor(message:string){super(message);this.name='VoteStoreError'}
}

function clean(v?:string){
 return v?.trim().replace(/^"|"$/g,'')||'';
}

function kv(){
 const url=clean(process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL);
 const token=clean(process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN);
 return url&&token?{url:url.replace(/\/$/,''),token}:null;
}

function parse(v:unknown):Votes{
 let cur=v;
 for(let i=0;i<4;i++){
  if(typeof cur==='string'){
   try{cur=JSON.parse(cur)}catch{return {}}
   continue;
  }
  if(cur&&typeof cur==='object'&&!Array.isArray(cur))return cur as Votes;
  return {};
 }
 return {};
}

async function redis(cmd:unknown[]){
 const k=kv();
 if(!k)throw new VoteStoreError('Chưa gắn Redis. Redeploy sau khi Connect to project.');
 const r=await fetch(k.url,{
  method:'POST',
  headers:{Authorization:`Bearer ${k.token}`,'Content-Type':'application/json'},
  body:JSON.stringify(cmd),
  cache:'no-store'
 });
 const j=await r.json().catch(()=>({})) as {result?:unknown,error?:string};
 if(!r.ok||j.error)throw new VoteStoreError(j.error||`Redis ${r.status}`);
 return j.result;
}

export async function load():Promise<Votes>{
 if(kv())return parse(await redis(['GET',KEY]));
 try{return parse(await readFile(file,'utf8'))}catch{return {}}
}

async function save(votes:Votes){
 const body=JSON.stringify(votes);
 if(kv()){
  await redis(['SET',KEY,body]);
  return;
 }
 if(process.env.VERCEL)throw new VoteStoreError('Vercel không giữ file. Mở project → Storage → Create Database → Upstash Redis, rồi Redeploy.');
 await mkdir(path.dirname(file),{recursive:true});
 await writeFile(file,body);
}

export function who(votes:Votes){
 const m:Record<string,string[]>={};
 for(const [email,id] of Object.entries(votes)){
  if(typeof id==='string'&&id.length>1)(m[id]||(m[id]=[])).push(email);
 }
 for(const id of Object.keys(m))m[id].sort();
 return m;
}

export async function tally(){
 const votes=await load();
 const counts:Record<string,number>={};
 for(const id of Object.values(votes)){
  if(typeof id==='string'&&id.length>1)counts[id]=(counts[id]||0)+1;
 }
 return {votes,counts,total:Object.keys(votes).length,who:who(votes)};
}

export async function setVote(email:string,id:string|null){
 const votes=await load();
 if(id)votes[email]=id;else delete votes[email];
 await save(votes);
 return tally();
}
