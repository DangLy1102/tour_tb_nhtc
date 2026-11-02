import {cookies} from 'next/headers';
import {sessionCookie} from '../../../../lib/auth';
import {getDb} from '../../../../lib/db';
import {tokenHash,isSameOrigin} from '../../../../lib/security.mjs';
export async function POST(request:Request){if(!isSameOrigin(request))return new Response('Forbidden',{status:403});const jar=await cookies(),token=jar.get(sessionCookie)?.value;if(token)try{await getDb().query('DELETE FROM tour_sessions WHERE token_hash=$1',[tokenHash(token)]);}catch{return Response.json({error:'Chưa đăng xuất được. Vui lòng thử lại.'},{status:503});}jar.delete(sessionCookie);return Response.json({ok:true});}
