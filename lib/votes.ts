import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const KEY='nhtc_tour_votes';
const file=path.join(process.cwd(),'data','votes.json');
export type Votes=Record<string,string>;

function kv(){
 const url=process.env.KV_REST_API_URL;
 const token=process.env.KV_REST_API_TOKEN;
 return url&&token?{url,token}:null;
}

function parse(v:unknown):Votes{
 if(!v)return {};
 if(typeof v==='string')try{return JSON.parse(v)}catch{return {}}
 if(typeof v==='object')return v as Votes;
 return {};
}

export async function load():Promise<Votes>{
 const k=kv();
 if(k){
  const r=await fetch(`${k.url}/get/${KEY}`,{headers:{Authorization:`Bearer ${k.token}`},cache:'no-store'});
  const j=await r.json() as {result:unknown};
  return parse(j.result);
 }
 try{return parse(await readFile(file,'utf8'))}catch{return {}}
}

async function save(votes:Votes){
 const body=JSON.stringify(votes);
 const k=kv();
 if(k){
  // ponytail: read-modify-write is enough for a few dozen staff votes
  await fetch(`${k.url}/set/${KEY}`,{method:'POST',headers:{Authorization:`Bearer ${k.token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  return;
 }
 await mkdir(path.dirname(file),{recursive:true});
 await writeFile(file,body);
}

export async function tally(){
 const votes=await load();
 const counts:Record<string,number>={};
 for(const id of Object.values(votes))counts[id]=(counts[id]||0)+1;
 return {votes,counts,total:Object.keys(votes).length};
}

export async function setVote(email:string,id:string|null){
 const votes=await load();
 if(id)votes[email]=id;else delete votes[email];
 await save(votes);
 return tally();
}
