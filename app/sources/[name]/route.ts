import {readFile} from 'node:fs/promises';
import path from 'node:path';
export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
 const {name}=await params;
 if(!['higo.pdf','nlg.pdf','zhang.pdf','shenzhen.pdf'].includes(name))return new Response('Not found',{status:404});
 try{return new Response(await readFile(path.join(process.cwd(),'sources',name)),{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${name}"`}});}
 catch{return new Response('Chưa tải được tài liệu.',{status:503});}
}
