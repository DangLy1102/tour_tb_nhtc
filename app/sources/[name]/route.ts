import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {currentUser,noStore} from '../../../lib/auth';
export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){try{if(!await currentUser())return new Response('Cần đăng nhập email công ty.',{status:401,headers:noStore});const {name}=await params;if(!['higo.pdf','nlg.pdf','zhang.pdf','shenzhen.pdf'].includes(name))return new Response('Not found',{status:404});return new Response(await readFile(path.join(process.cwd(),'sources',name)),{headers:{...noStore,'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${name}"`}});}catch{return new Response('Chưa tải được tài liệu.',{status:503});}}
